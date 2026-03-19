import type { ElaraSDK } from "@elara/core";

// ─── Types ───

/** Generic OpenClaw event shape */
export interface OpenClawEvent {
  type: string;
  data: Record<string, unknown>;
}

export interface WatchSession {
  /** Unique session identifier */
  sessionId?: string;
}

// ─── ElaraOpenClaw ───

export class ElaraOpenClaw {
  private sdk: ElaraSDK;

  constructor(sdk: ElaraSDK) {
    this.sdk = sdk;
  }

  /**
   * Watch an OpenClaw agent stream and automatically sign all events.
   * 
   * Usage:
   *   const stream = openclawAgent.run(input);
   *   for await (const chunk of elara.watchAndSign(stream, { sessionId: "abc" })) {
   *     // your code — Elara signs in the background
   *   }
   */
  async *watchAndSign(
    agentStream: AsyncIterable<OpenClawEvent>,
    session?: WatchSession
  ): AsyncGenerator<OpenClawEvent> {
    const sessionId = session?.sessionId ?? crypto.randomUUID();

    // Sign session start
    await this.sdk.sign("node_update", {
      event: "session_start",
      sessionId,
      startedAt: Date.now(),
    });

    for await (const event of agentStream) {
      // Process specific openclaw event types
      try {
        await this.signEvent(event, sessionId);
      } catch {
        // Continue yielding even if signing fails
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
   * Co-signs human intervention, then optionally processes resumed stream.
   */
  async resumeAndSign(
    humanInput: Record<string, unknown>,
    session?: WatchSession
  ): Promise<void> {
    const sessionId = session?.sessionId ?? crypto.randomUUID();

    // Co-sign the human intervention
    await this.sdk.coSign("human_intervention", {
      humanInput,
      source: "human",
      sessionId,
      resumedAt: Date.now(),
    });
  }

  // ─── Private ───

  private async signEvent(event: OpenClawEvent, sessionId: string): Promise<void> {
    const { type, data } = event;

    switch (type) {
      case "tool_call_start":
        await this.sdk.sign("tool_start", {
          toolName: data.name,
          sessionId,
          input: data.input,
          toolCallId: data.id,
        });
        break;
      
      case "tool_call_end":
        await this.sdk.sign("tool_end", {
          toolName: data.name,
          sessionId,
          output: data.output,
          toolCallId: data.id,
        });
        break;

      case "message":
        if (data.role === "assistant" && data.finish_reason) {
          await this.sdk.sign("llm_response", {
            node: "openclaw_agent",
            sessionId,
            content: data.content,
          });
        }
        break;

      case "state_update":
        await this.sdk.sign("node_update", {
          node: data.node || "openclaw",
          sessionId,
          state: data.state,
        });
        break;
    }
  }
}
