import { openai } from "@ai-sdk/openai";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { createTool } from "@mastra/core/tools";
import { createVectorQueryTool, MDocument } from "@mastra/rag";
import { S3Vectors } from "@mastra/s3vectors";
import { embed, embedMany } from "ai";
import { z } from "zod";

const DEFAULT_INDEX = process.env.S3_VECTORS_INDEX_NAME || "knowledge";
const VECTOR_DIMENSION = 1536; // text-embedding-3-small

let s3Store: S3Vectors | null = null;

function getStore(): S3Vectors {
  if (s3Store) return s3Store;
  const vectorBucketName = process.env.S3_VECTORS_BUCKET_NAME;
  const region = process.env.AWS_REGION || "ap-southeast-2";
  if (!vectorBucketName) {
    throw new Error(
      "S3_VECTORS_BUCKET_ARN or S3_VECTORS_BUCKET_NAME env is required",
    );
  }
  s3Store = new S3Vectors({
    vectorBucketName,
    clientConfig: { region },
    nonFilterableMetadataKeys: ["content"],
  });
  return s3Store;
}

async function ensureIndex(indexName: string) {
  const store = getStore();
  await store.createIndex({
    indexName,
    dimension: VECTOR_DIMENSION,
    metric: "cosine",
  });
}

export const knowledgeAddTool = createTool({
  id: "knowledge_add",
  description:
    "Add knowledge content: chunks, embeds, and upserts to S3 Vectors",
  inputSchema: z.object({
    title: z.string().describe("Document title"),
    content: z.string().describe("Raw document content (text or markdown)"),
    source: z.string().optional().describe("Source label or URL"),
    tags: z.array(z.string()).optional().describe("List of tags"),
    indexName: z
      .string()
      .optional()
      .describe("S3 Vectors index name; defaults to knowledge"),
  }),
  outputSchema: z.object({
    indexName: z.string(),
    insertedIds: z.array(z.string()),
    chunkCount: z.number(),
  }),
  execute: async ({ context }) => {
    const indexName = (context.indexName || DEFAULT_INDEX)
      .replaceAll("_", "-")
      .toLowerCase();
    await ensureIndex(indexName);

    const doc = MDocument.fromText(context.content as string, {
      indexName: context.indexName,
      title: context.title,
      source: context.source,
      tags: context.tags,
    });
    const chunks = await doc.chunk({
      strategy: "recursive",
      maxSize: 512,
      overlap: 50,
    });
    const texts = chunks.map((c) => c.text);

    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: texts,
    });

    const store = getStore();
    const ids = await store.upsert({
      indexName,
      vectors: embeddings as number[][],
      metadata: texts.map((t, i) => ({
        title: context.title,
        source: context.source,
        tags: context.tags,
        chunkIndex: i,
        content: t,
      })),
    });

    return { indexName, insertedIds: ids, chunkCount: texts.length };
  },
});

export const knowledgeUpdateTool = createTool({
  id: "knowledge_update",
  description:
    "Update a knowledge vector by ID (content re-embed and/or metadata replace)",
  inputSchema: z.object({
    id: z.string().describe("Vector ID to update"),
    content: z
      .string()
      .optional()
      .describe("New content to re-embed for this vector"),
    metadata: z
      .record(z.any())
      .optional()
      .describe("New metadata object (replaces existing keys)"),
    indexName: z.string().optional(),
  }),
  outputSchema: z.object({ updated: z.boolean() }),
  execute: async ({ context }) => {
    const indexName = (context.indexName || DEFAULT_INDEX)
      .replaceAll("_", "-")
      .toLowerCase();
    await ensureIndex(indexName);
    const store = getStore();
    let vector: number[] | undefined;
    if (context.content) {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: context.content,
      });
      vector = embedding as number[];
    }
    await store.updateVector({
      indexName,
      id: context.id,
      update: {
        vector,
        metadata: context.metadata,
      },
    });
    return { updated: true };
  },
});

export const knowledgeRemoveTool = createTool({
  id: "knowledge_remove",
  description: "Remove one or more knowledge vectors by ID",
  inputSchema: z.object({
    ids: z.array(z.string()).describe("Vector IDs to delete"),
    indexName: z.string().optional(),
  }),
  outputSchema: z.object({ deleted: z.number() }),
  execute: async ({ context }) => {
    const indexName = (context.indexName || DEFAULT_INDEX)
      .replaceAll("_", "-")
      .toLowerCase();
    await ensureIndex(indexName);
    const store = getStore();
    let deleted = 0;
    for (const id of context.ids) {
      await store.deleteVector({ indexName, id });
      deleted += 1;
    }
    return { deleted };
  },
});

export const knowledgeSearchTool = createTool({
  id: "knowledge_search",
  description:
    "Semantic search of knowledge with optional metadata filter (S3 Vectors filter syntax)",
  inputSchema: z.object({
    queryText: z.string().describe("Natural language query"),
    topK: z.number().optional().default(10),
    filter: z
      .record(z.any())
      .optional()
      .describe(
        `S3 Vectors filter object. Follow these rules:
                - Top-level logical operators allowed: $and, $or (non-empty arrays)
                - Equality: $eq, $ne with string | number | boolean only; null/undefined not allowed; array equality not supported (use $in/$nin)
                - Numeric/Date comparisons: $gt, $gte, $lt, $lte. Date values are converted to epoch ms
                - Array membership: $in, $nin with non-empty arrays of string | number | boolean (Date values are converted to epoch ms)
                - Existence check: $exists with boolean
                - Implicit AND is normalized: {a:1,b:2} → { $and: [{a:1},{b:2}] }
                - Unsupported/forbidden: $not, $nor, $regex, $all, $elemMatch, $size, $text
                - Non-filterable metadata keys (e.g. "content") cannot be used in filters

                Examples:
                { genre: { $in: ["doc", "comedy"] }, year: { $gte: 2020 } }
                {
                  $and: [
                    { price: { $gte: 100, $lte: 1000 } },
                    { $or: [ { stock: { $gt: 0 } }, { preorder: true } ] }
                  ]
                }
                { timestamp: { $gt: new Date("2024-01-01T00:00:00Z") } }`,
      ),
    includeVector: z.boolean().optional().default(false),
    indexName: z.string().optional(),
  }),
  outputSchema: z.object({
    relevantContext: z.string(),
    sources: z.array(
      z.object({
        id: z.string(),
        score: z.number(),
        metadata: z.record(z.any()),
      }),
    ),
  }),
  execute: async ({ context }) => {
    const indexName = (context.indexName || DEFAULT_INDEX)
      .replaceAll("_", "-")
      .toLowerCase();
    await ensureIndex(indexName);
    const vectorQueryTool = createVectorQueryTool({
      vectorStoreName: "s3vectors",
      vectorStore: getStore(),
      indexName,
      model: openai.embedding("text-embedding-3-small"),
    });
    const runtimeContext = new RuntimeContext();
    const { relevantContext, sources } = await vectorQueryTool.execute({
      context: {
        queryText: context.queryText,
        topK: context.topK,
        filter: context.filter,
      },
      runtimeContext,
    });
    return { relevantContext, sources };
  },
});
