import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { MastraClient } from "@mastra/client-js";

const BASE_URL = "https://<resource-name>.lambda-url.<region>.on.aws";
const TEST_SECRET: string = process.env.MASTRA_JWT_SECRET ?? "";

async function startServer() {
  const { mastra } = await import("../src/mastra/index.ts");

  // Start server if not already started
  if ((mastra as any).start) {
    await (mastra as any).start();
  } else if ((mastra as any).listen) {
    await (mastra as any).listen();
  }

  // Simple readiness check loop
  const timeoutMs = 10_000;
  const startMs = Date.now();
  // Try a lightweight endpoint; tools listing will also verify readiness
  while (Date.now() - startMs < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api`);
      if (res.ok) break;
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  return mastra as any;
}

async function stopServer(mastraInstance: any) {
  if (mastraInstance?.stop) {
    await mastraInstance.stop();
  } else if (mastraInstance?.close) {
    await mastraInstance.close();
  }
}

test("MastraClient can list knowledge tools over JWT auth", async (t) => {
  const mastraInstance = await startServer();

  if (!TEST_SECRET) {
    t.skip("MASTRA_JWT_SECRET is not set; skipping JWT-auth e2e test");
    await stopServer(mastraInstance);
    return;
  }

  const token = jwt.sign({ sub: "e2e" }, TEST_SECRET, { algorithm: "HS256" });
  const client = new MastraClient({
    baseUrl: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const tools = await client.getTools();
    console.log(tools);

    assert.ok(tools && typeof tools === "object", "tools should be an object");
    const ids = Object.keys(tools);
    assert.ok(ids.length > 0, "should return at least one tool");

    // Ensure knowledge tool set is present (server exposes export names)
    for (const toolId of [
      "knowledgeAddTool",
      "knowledgeUpdateTool",
      "knowledgeRemoveTool",
      "knowledgeSearchTool",
    ]) {
      assert.ok(
        toolId in tools,
        `expected tool to exist: ${toolId} (found: ${ids.join(", ")})`,
      );
    }
  } finally {
    await stopServer(mastraInstance);
  }
});


