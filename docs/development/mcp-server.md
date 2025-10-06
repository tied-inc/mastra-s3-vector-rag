# MCP Server

The Model Context Protocol (MCP) server provides a standardized way to expose RAG tools to AI applications.

## Starting the MCP Server

Start the `knowledge` server via stdio:

```bash
pnpm run mcp:knowledge:stdio
```

## Available Tools

The MCP server exposes the following tools:

### `knowledge_add`

Document chunking, embedding generation, and upsert to the vector store.

**Parameters:**
- `content`: Document content to add
- `metadata`: Optional metadata object
- `chunkSize`: Optional chunk size (default: 1000)
- `chunkOverlap`: Optional chunk overlap (default: 200)

**Example:**
```json
{
  "content": "Your document content here...",
  "metadata": {
    "source": "example.pdf",
    "page": 1
  }
}
```

### `knowledge_update`

Update vector and metadata by ID.

**Parameters:**
- `id`: Vector ID to update
- `content`: New content
- `metadata`: Optional new metadata

### `knowledge_remove`

Delete vectors by IDs.

**Parameters:**
- `ids`: Array of vector IDs to remove

**Example:**
```json
{
  "ids": ["vec_123", "vec_456"]
}
```

### `knowledge_search`

Semantic search with optional metadata filter.

**Parameters:**
- `query`: Search query text
- `topK`: Number of results to return (default: 5)
- `metadataFilter`: Optional metadata filter object

**Example:**
```json
{
  "query": "What is S3 Vectors?",
  "topK": 5,
  "metadataFilter": {
    "source": "example.pdf"
  }
}
```

## Configuration

### Index Settings

- **Default index name**: `knowledge`
- **Embedding dimension**: 1024 (Amazon Bedrock Titan)
- **Default chunk size**: 1000 characters
- **Default chunk overlap**: 200 characters

### Environment Variables

Ensure the following environment variables are set:

```bash
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
export AWS_REGION=ap-southeast-2
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

## Integration with Claude Desktop

To use this MCP server with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "knowledge": {
      "command": "pnpm",
      "args": ["run", "mcp:knowledge:stdio"],
      "cwd": "/path/to/mastra-s3-vector-rag"
    }
  }
}
```

## Implementation Files

- Server: `src/mastra/mcp/knowledge-server.ts`
- Stdio wrapper: `src/mastra/mcp/knowledge-stdio.ts`
- RAG tools: `src/mastra/tools/knowledge.ts`

## Next Steps

- [Deploy to AWS](../deployment/cdk.md)
- [API Reference](../api/reference.md)

