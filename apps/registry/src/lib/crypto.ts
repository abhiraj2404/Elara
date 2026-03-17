import crypto from "node:crypto";

export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

export function generateApiKey(): string {
  return `elk_${crypto.randomBytes(24).toString("hex")}`;
}

export function signData(data: string, privateKeyPem: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKeyPem, "base64");
}

export function serializeContent(content: Record<string, unknown>): string {
  return JSON.stringify(content, Object.keys(content).sort());
}
