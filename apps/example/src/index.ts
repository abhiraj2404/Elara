import { ChatGoogle } from "@langchain/google";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import {
  task,
  entrypoint,
  addMessages,
} from "@langchain/langgraph";
import {
  SystemMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { ToolCall } from "@langchain/core/messages/tool";
import * as z from "zod";
import dotenv from "dotenv";
dotenv.config();

// ✨ Elara — 2 imports, 3 lines of setup
import { ElaraSDK, ElaraVerifier } from "@elara/core";
import { Elara } from "@elara/langchain";

const sdk = new ElaraSDK({ agentId: "math-agent-001" });
await sdk.init();
const elara = new Elara(sdk);
console.log("🔐 Elara initialized\n");

// ─── Define tools and model ───

const model = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY || "",
  model: "gemini-2.5-flash",
  temperature: 0,
});

const add = tool(({ a, b }) => a + b, {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

const multiply = tool(({ a, b }) => a * b, {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

const divide = tool(({ a, b }) => a / b, {
  name: "divide",
  description: "Divide two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

const toolsByName: Record<string, DynamicStructuredTool> = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
};
const tools = Object.values(toolsByName);
const modelWithTools = model.bindTools(tools);

// ─── Define model and tool tasks ───

const callLlm = task({ name: "callLlm" }, async (messages: BaseMessage[]) => {
  return modelWithTools.invoke([
    new SystemMessage(
      "You are a helpful assistant tasked with performing arithmetic on a set of inputs."
    ),
    ...messages,
  ]);
});

const callTool = task({ name: "callTool" }, async (toolCall: ToolCall) => {
  const toolInstance = toolsByName[toolCall.name];
  return toolInstance?.invoke(toolCall);
});

// ─── Define agent ───

const agent = entrypoint({ name: "agent" }, async (messages: BaseMessage[]) => {
  let modelResponse = await callLlm(messages);

  while (true) {
    if (!modelResponse.tool_calls?.length) {
      break;
    }

    const toolResults = await Promise.all(
      modelResponse.tool_calls.map((toolCall) => callTool(toolCall))
    );
    messages = addMessages(messages, [modelResponse, ...toolResults]);
    modelResponse = await callLlm(messages);
  }

  return messages;
});

// ─── Run with Elara watchAndSign ───

console.log("🤖 Running agent: \"Add 3 and 4. Then multiply the result by 5.\"\n");

// The user streams the agent, then wraps with elara.watchAndSign()
const agentStream = await agent.stream(
  [new HumanMessage("Add 3 and 4. Then multiply the result by 5.")],
  { streamMode: "updates" }
);

for await (const chunk of elara.watchAndSign(agentStream)) {
  // Normal user code — process the stream as usual
  const data = chunk as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    if (key === "__interrupt__") continue;
    console.log(`📦 [${key}]:`, JSON.stringify(value, null, 2)?.slice(0, 120));
  }
}

// ─── Show proof chain ───

console.log("\n\n═══════════════════════════════════════════");
console.log("  🔐 ELARA PROOF-OF-THOUGHT CHAIN");
console.log("═══════════════════════════════════════════\n");

const proofs = sdk.getProofs();
const keys = sdk.getPublicKeys();
const verifier = new ElaraVerifier(keys);
const results = verifier.verifyAll(proofs);

for (const r of results) {
  const humanStr = r.humanVerified === null ? "n/a" : String(r.humanVerified);
  const status = r.isValid ? "✅" : "❌";
  const intervention = r.proof.humanSignature ? "🧑 HUMAN+AGENT" : "🤖 AGENT ONLY";

  console.log(`${status} [${r.proof.type}] ${intervention}`);
  console.log(`   Hash: ${r.proof.contentHash.slice(0, 24)}...`);
  console.log(`   Verified: agent=${r.agentVerified} human=${humanStr}`);
  console.log("");
}

const allValid = results.every((r) => r.isValid);
console.log(`Total proofs: ${proofs.length}`);
console.log(`All verified: ${allValid ? "✅ YES — fully autonomous execution proven" : "❌ NO"}`);