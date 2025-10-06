# Mastra S3 Vector RAG

Welcome to the **Mastra S3 Vector RAG** documentation!

This is a Mastra app that uses AWS S3 Vectors as the vector store. It exposes RAG tools (add, update, remove, search) via an MCP server and runs a Mastra server on port 8080. You can deploy it to AWS Lambda (Function URL) using CDK.

## Features

- **S3 Vectors**: index lifecycle and vector CRUD/search
- **Amazon Bedrock Embeddings**: `amazon.titan-embed-text-v2:0` (1024 dimensions)
- **MCP Server**: `knowledge_add / knowledge_update / knowledge_remove / knowledge_search`
- **Mastra Server**: JWT-protected (`MASTRA_JWT_SECRET`)

## Quick Links

- [Requirements](setup/requirements.md)
- [Setup Guide](setup/s3-vectors.md)
- [Local Development](development/local.md)
- [Deployment](deployment/cdk.md)
- [Using with MCP Clients](usage/mcp-clients.md)

## Implementation Notes

- Server: `src/mastra/index.ts` (port 8080, JWT required)
- MCP: `src/mastra/mcp/knowledge-server.ts` / `knowledge-stdio.ts`
- RAG tools: `src/mastra/tools/knowledge.ts`
  - Default index: `knowledge`
  - Embeddings: Amazon Bedrock `amazon.titan-embed-text-v2:0` (1024 dimensions)
  - Key env: `S3_VECTORS_BUCKET_NAME`, `AWS_REGION` (default `ap-southeast-2`)
  - Required AWS permissions: `bedrock:InvokeModel` for the Titan embedding model

## License

MIT

