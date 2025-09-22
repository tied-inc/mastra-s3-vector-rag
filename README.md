## mastra-s3-vector-rag

This is a Mastra app that uses AWS S3 Vectors as the vector store. It exposes RAG tools (add, update, remove, search) via an MCP server and runs a Mastra server on port 8080. You can deploy it to AWS Lambda (Function URL) using CDK.

### Features
- **S3 Vectors**: index lifecycle and vector CRUD/search
- **OpenAI Embeddings**: `text-embedding-3-small` (1536 dimensions)
- **MCP Server**: `knowledge_add / knowledge_update / knowledge_remove / knowledge_search`
- **Mastra Server**: JWT-protected (`MASTRA_JWT_SECRET`)

---

## Requirements
- Node.js >= 20.9.0
- pnpm
- AWS account (S3 Vectors bucket provisioned)
- OpenAI API key

---

## Setup
```bash
pnpm install

# CDK project (only if you plan to deploy)
cd cdk && pnpm install && cd -
```

---

## Environment variables

- `OPENAI_API_KEY` (required): your OpenAI API key
- `MASTRA_JWT_SECRET` (required): secret used for Mastra server JWT
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (required): IAM creds with access to S3 Vectors
- `AWS_REGION` (optional): defaults to `ap-southeast-2` (set to your bucket’s region)
- `S3_VECTORS_BUCKET_NAME` (required for local run): S3 Vectors bucket name
- `S3_VECTORS_BUCKET_ARN` (used by CDK deploy): S3 Vectors bucket ARN (e.g. `arn:aws:s3vectors:<region>:<account>:bucket/<name>`)

Note: The runtime code expects a bucket name when running locally/server-side. CDK currently forwards `S3_VECTORS_BUCKET_ARN` to the Lambda. If your runtime also needs the bucket name, extend the CDK stack to pass `S3_VECTORS_BUCKET_NAME` as an additional environment variable.

---

## Local development

1) Export required env vars
```bash
export OPENAI_API_KEY=sk-...
export MASTRA_JWT_SECRET=dev-secret
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=ap-southeast-2    # match your bucket region
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

2) Optional: bring up helper services with Docker Compose

The included `compose.yml` starts DynamoDB Local and LocalStack(S3). It is not a local replacement for S3 Vectors, but can help with other Mastra storage development.
```bash
docker compose up -d
```

3) Start the dev server
```bash
pnpm dev
# defaults to http://localhost:8080
```

4) Production build/run (optional)
```bash
pnpm build
pnpm start
```

---

## MCP server (stdio)

Start the `knowledge` server via stdio:
```bash
pnpm run mcp:knowledge:stdio
```
Tools provided:
- `knowledge_add` (document chunking, embedding generation, upsert)
- `knowledge_update` (update vector + metadata by ID)
- `knowledge_remove` (delete vectors by IDs)
- `knowledge_search` (semantic search with optional metadata filter)

Default index name is `knowledge`, embedding dimension is 1536.

---

## Deploy with CDK (Lambda + Function URL)

1) Prereqs
```bash
npm i -g aws-cdk
cd cdk && pnpm install

export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2        # choose your region

export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:<region>:<account>:bucket/<name>
export MASTRA_JWT_SECRET=prod-secret
export NODE_ENV=production

# bootstrap once if needed
pnpm run cdk bootstrap
```

2) Deploy
```bash
pnpm run deploy
```

The stack outputs a `FunctionUrl`. For a quick health check, try `GET /api`.

Note: The default stack passes `S3_VECTORS_BUCKET_ARN` to the Lambda. If your runtime requires the bucket name, add `S3_VECTORS_BUCKET_NAME` to the Lambda `environment` in `cdk/lib/mastra-stack.ts`.

---

## Implementation notes
- Server: `src/mastra/index.ts` (port 8080, JWT required)
- MCP: `src/mastra/mcp/knowledge-server.ts` / `knowledge-stdio.ts`
- RAG tools: `src/mastra/tools/knowledge.ts`
  - Default index: `knowledge`
  - Embeddings: OpenAI `text-embedding-3-small`
  - Key env: `S3_VECTORS_BUCKET_NAME`, `AWS_REGION` (default `ap-southeast-2`)

---

## License
MIT


