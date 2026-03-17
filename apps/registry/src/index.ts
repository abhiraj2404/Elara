import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { authRouter } from "./routes/auth.js";
import { agentsRouter } from "./routes/agents.js";
import { proofsRouter } from "./routes/proofs.js";
import { verifyRouter } from "./routes/verify.js";

const app = express();
const PORT = process.env["PORT"] ?? 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/proofs", proofsRouter);
app.use("/api/verify", verifyRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "elara-registry" });
});

app.listen(PORT, () => {
  console.log(`🔐 Elara registry running on http://localhost:${PORT}`);
});
