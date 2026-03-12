import type { ElaraSDK } from "@elara/core";
import { Command } from "@langchain/langgraph";

// ─── Types ───

/** Any LangGraph runnable that exposes a .stream() method */
interface Streamable {
  stream: (input: unknown, config?: Record<string, unknown>) => Promise<AsyncIterable<unknown>>;
}

interface WatchSession {
  /** Unique session identifier */
  sessionId?: string;
}

// ─── Elara ───

export class Elara {
  private sdk: ElaraSDK;

  constructor(sdk: ElaraSDK) {
    this.sdk = sdk;
  }

  /**
   * Watch an agent stream and automatically sign all events.
   * 
   * Usage:
   *   const agentStream = await agent.stream(input, { streamMode: [...] });
   *   for await (const chunk of elara.watchAndSign(agentStream, { sessionId: "abc" })) {
   *     // your code — Elara signs in the background
   *   }
   */
  async *watchAndSign(
    agentStream: AsyncIterable<unknown>,
    session?: WatchSession
  ): AsyncGenerator<unknown> {
    const sessionId = session?.sessionId ?? crypto.randomUUID();

    // Sign session start
    await this.sdk.sign("node_update", {
      event: "session_start",
      sessionId,
      startedAt: Date.now(),
    });

    for await (const event of agentStream) {
      // Try to detect if this is a multi-mode tuple [mode, chunk]
      if (Array.isArray(event) && event.length === 2 && typeof event[0] === "string") {
        const [mode, chunk] = event as [string, unknown];
        await this.signByMode(mode, chunk, sessionId);
      } else {
        // Single-mode stream — treat as updates
        await this.signByMode("updates", event, sessionId);
      }

      // Pass through to the user
      yield event;
    }

    // Sign session end
    await this.sdk.sign("node_update", {
      event: "session_end",
      sessionId,
      endedAt: Date.now(),
      totalProofs: this.sdk.getProofs().length,
    });
  }

  /**
   * Resume from an interrupt — signs the human intervention, then watches the resumed stream.
   */
  async *resumeAndSign(
    graph: Streamable,
    humanInput: unknown,
    config: Record<string, unknown>,
    session?: WatchSession
  ): AsyncGenerator<unknown> {
    const sessionId = session?.sessionId ?? crypto.randomUUID();

    // Co-sign the human intervention
    await this.sdk.coSign("human_intervention", {
      humanInput: humanInput as Record<string, unknown>,
      source: "human",
      sessionId,
      resumedAt: Date.now(),
    });

    // Resume the graph and watch the stream
    const resumedStream = await graph.stream(
      new Command({ resume: humanInput }),
      config
    );

    yield* this.watchAndSign(resumedStream, { sessionId });
  }

  // ─── Private ───

  private async signByMode(mode: string, chunk: unknown, sessionId: string): Promise<void> {
    try {
      switch (mode) {
        case "updates":
          await this.signUpdates(chunk as Record<string, unknown>, sessionId);
          break;
        case "messages":
          await this.signMessage(chunk as [unknown, unknown], sessionId);
          break;
        case "tools":
          await this.signTool(chunk as Record<string, unknown>, sessionId);
          break;
      }
    } catch {
      // Don't let signing errors break the stream
    }
  }

  private async signUpdates(chunk: Record<string, unknown>, sessionId: string): Promise<void> {
    for (const [nodeName, state] of Object.entries(chunk)) {
      await this.sdk.sign("node_update", {
        node: nodeName,
        sessionId,
        state: state as Record<string, unknown>,
      });
    }
  }

  private async signMessage(chunk: [unknown, unknown], sessionId: string): Promise<void> {
    const [messageChunk, metadata] = chunk;
    const msg = messageChunk as Record<string, unknown>;
    const meta = metadata as Record<string, unknown>;

    // Only sign complete messages (with finish_reason), not individual tokens
    const responseMeta = msg["response_metadata"] as Record<string, unknown> | undefined;
    if (responseMeta?.["finish_reason"]) {
      await this.sdk.sign("llm_response", {
        node: meta["langgraph_node"],
        sessionId,
        content: msg["content"],
      });
    }
  }

  private async signTool(chunk: Record<string, unknown>, sessionId: string): Promise<void> {
    const event = chunk["event"] as string;

    if (event === "on_tool_start") {
      await this.sdk.sign("tool_start", {
        toolName: chunk["name"],
        sessionId,
        input: chunk["input"],
        toolCallId: chunk["toolCallId"],
      });
    } else if (event === "on_tool_end") {
      await this.sdk.sign("tool_end", {
        toolName: chunk["name"],
        sessionId,
        output: chunk["output"],
        toolCallId: chunk["toolCallId"],
      });
    }
  }
}
