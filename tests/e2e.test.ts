import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { MastraClient } from "@mastra/client-js";

const BASE_URL = process.env.BASE_URL ?? "";
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


test("knowledge add, update, remove flow works", async (t) => {
  const mastraInstance = await startServer();

  if (!TEST_SECRET) {
    t.skip("MASTRA_JWT_SECRET is not set; skipping JWT-auth e2e test");
    await stopServer(mastraInstance);
    return;
  }

  const token = jwt.sign({ sub: "e2e" }, TEST_SECRET, { algorithm: "HS256" });
  const client = new MastraClient({
    baseUrl: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const indexName = `e2e-aur-${Date.now()}`;

  try {
    const toolsMap: Record<string, any> = await client.getTools();
    const addToolId = toolsMap["knowledgeAddTool"]?.id ?? "knowledge_add";
    const updateToolId = toolsMap["knowledgeUpdateTool"]?.id ?? "knowledge_update";
    const removeToolId = toolsMap["knowledgeRemoveTool"]?.id ?? "knowledge_remove";

    const addTool = client.getTool(addToolId);
    const updateTool = client.getTool(updateToolId);
    const removeTool = client.getTool(removeToolId);

    const addRes: any = await addTool.execute({
      data: {
        title: "E2E AUR",
        content: "Hello world knowledge item A. This is small.",
        tags: ["e2e", "aur"],
        indexName,
      },
    });

    assert.ok(Array.isArray(addRes.insertedIds) && addRes.insertedIds.length > 0);

    const firstId = addRes.insertedIds[0];
    const updateRes: any = await updateTool.execute({
      data: {
        id: firstId,
        content: "Hello world knowledge item A updated.",
        metadata: { tag: "updated" },
        indexName,
      },
    });
    assert.equal(updateRes.updated, true);

    const removeRes: any = await removeTool.execute({
      data: {
        ids: addRes.insertedIds,
        indexName,
      },
    });
    assert.equal(removeRes.deleted, addRes.insertedIds.length);
  } finally {
    await stopServer(mastraInstance);
  }
});


test("knowledge search returns multiple relevant documents", async (t) => {
  const mastraInstance = await startServer();

  if (!TEST_SECRET) {
    t.skip("MASTRA_JWT_SECRET is not set; skipping JWT-auth e2e test");
    await stopServer(mastraInstance);
    return;
  }

  const token = jwt.sign({ sub: "e2e" }, TEST_SECRET, { algorithm: "HS256" });
  const client = new MastraClient({
    baseUrl: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const indexName = `e2e-search-${Date.now()}`;

  const toolsMap: Record<string, any> = await client.getTools();
  const addToolId = toolsMap["knowledgeAddTool"]?.id ?? "knowledge_add";
  const searchToolId = toolsMap["knowledgeSearchTool"]?.id ?? "knowledge_search";
  const removeToolId = toolsMap["knowledgeRemoveTool"]?.id ?? "knowledge_remove";

  const addTool = client.getTool(addToolId);
  const searchTool = client.getTool(searchToolId);
  const removeTool = client.getTool(removeToolId);

  const insertedAll: string[] = [];

  try {
    const doc1: any = await addTool.execute({
      data: {
        title: "France Capital 1",
        content:
          "The capital of France is Paris. The Eiffel Tower is a famous landmark.",
        tags: ["e2e", "france"],
        indexName,
      },
    });

    const doc2: any = await addTool.execute({
      data: {
        title: "France Capital 2",
        content:
          "Paris is the capital city of France. It is home to the Louvre Museum.",
        tags: ["e2e", "france"],
        indexName,
      },
    });

    insertedAll.push(...doc1.insertedIds, ...doc2.insertedIds);
    assert.ok(insertedAll.length >= 2);

    const searchRes: any = await searchTool.execute({
      data: {
        queryText: "What is the capital of France?",
        topK: 5,
        indexName,
      },
    });
    console.log(searchRes);

    assert.ok(Array.isArray(searchRes.sources));
    // Expect at least two results referencing our inserted vectors
    const returnedIds = new Set<string>(searchRes.sources.map((s: any) => s.id));
    const foundFromDoc1 = doc1.insertedIds.some((id: string) => returnedIds.has(id));
    const foundFromDoc2 = doc2.insertedIds.some((id: string) => returnedIds.has(id));
    assert.ok(foundFromDoc1 && foundFromDoc2, "expected results from both docs");
  } finally {
    if (insertedAll.length > 0) {
      try {
        await removeTool.execute({ data: { ids: insertedAll, indexName } });
      } catch {
        // ignore cleanup failures
      }
    }
    await stopServer(mastraInstance);
  }
});


