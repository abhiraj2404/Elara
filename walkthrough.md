# Elara Phase 1 — Walkthrough

## What Was Built

### `@elara/core` (4.70 KB)
| File | Purpose |
|---|---|
| [types.ts](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/types.ts) | [ProofRecord](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/types.ts#12-28), [ProofType](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/types.ts#3-9), [ElaraConfig](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/types.ts#31-37), [VerificationResult](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/types.ts#47-57) |
| [sdk.ts](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts) | [ElaraSDK](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#15-186) — [init()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#30-52), [sign()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#55-83), [coSign()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#84-118), keypair management |
| [verifier.ts](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/verifier.ts) | [ElaraVerifier](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/verifier.ts#5-66) — [verify()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/verifier.ts#14-41), [verifyAll()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/verifier.ts#42-48) |

### `@elara/langchain` (2.45 KB)
| File | Purpose |
|---|---|
| [stream.ts](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/langchain/src/stream.ts) | [ElaraStream](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/langchain/src/stream.ts#17-137) — wraps `graph.stream()`, signs events, [resume()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/langchain/src/stream.ts#51-74) for HITL |

## Two-Keypair Model

- **Agent key** (ECDSA P-256) — stored at `~/.elara/{agentId}.agent.pem`
- **Human key** (ECDSA P-256) — stored at `~/.elara/{agentId}.human.pem`
- [sign()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#55-83) → agent key only (autonomous)
- [coSign()](file:///c:/Users/chauh/OneDrive/Desktop/web3/Projects/Elara/packages/core/src/sdk.ts#84-118) → both keys (human intervention)

## Test Results

```
── Autonomous Proof ──
Type: tool_start
Agent Sig: MEUCIB2tKduCJ7Moz63yUR6LXazy...
Human Sig: none (autonomous)

── Human Intervention Proof ──
Type: human_intervention
Agent Sig: MEQCIDKR366BbWSZZ8dI2LNv+Ur+...
Human Sig: MEYCIQDS7Ln6hdVCRIxfP6XM+dDM...

── Verification Results ──
tool_start:          agent=true  human=n/a   valid=true
human_intervention:  agent=true  human=true  valid=true

✅ ALL PROOFS VERIFIED SUCCESSFULLY
```

## Next Steps
- Phase 2: Backend (key storage, proof registry), Explorer UI, Docs
