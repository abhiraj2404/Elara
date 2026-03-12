import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { agentsRouter } from "./routes/agents.js";
import { proofsRouter } from "./routes/proofs.js";
import { verifyRouter } from "./routes/verify.js";

const app = express();
const PORT = process.env["PORT"] ?? 3001;

// ─── Middleware ───

app.use(cors());
app.use(express.json());

// ─── Routes ───

app.use("/api/agents", agentsRouter);
app.use("/api/proofs", proofsRouter);
app.use("/api/verify", verifyRouter);

// ─── Health check ───

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "elara-registry" });
});

// ─── Start ───

app.listen(PORT, () => {
  console.log(`🔐 Elara registry running on http://localhost:${PORT}`);
  console.log(`   Agents:  POST /api/agents/register`);
  console.log(`   Proofs:  POST /api/proofs`);
  console.log(`   Verify:  GET  /api/verify/:proofId`);
});
