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
import * as readline from "node:readline";
dotenv.config();

import { ElaraSDK } from "@elara/core";
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

  return modelResponse.content;
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(): Promise<string> {
  return new Promise((resolve) => {
    rl.question("\n💬 You: ", resolve);
  });
}

console.log("🤖 Math Agent (type 'exit' to quit)\n");

while (true) {
  const input = await prompt();

  if (input.trim().toLowerCase() === "exit") {
    console.log("\n👋 Bye!");
    rl.close();
    process.exit(0);
  }

  if (!input.trim()) continue;

  const agentStream = await agent.stream(
    [new HumanMessage(input)],
    { streamMode: "updates" }
  );

  let answer = "";
  for await (const chunk of elara.watchAndSign(agentStream)) {
    const data = chunk as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      if (key === "__interrupt__") continue;
      if (key === "agent") {
        answer = String(value);
      }
    }
  }

  console.log(`\n🤖 Agent: ${answer}`);
}