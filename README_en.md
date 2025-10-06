# mastra-s3-vector-rag

A Mastra application that uses AWS S3 Vectors as the vector store. It exposes RAG tools via an MCP server and can be deployed to AWS Lambda (Function URL).

## Features

- **S3 Vectors**: Vector CRUD/search
- **Amazon Bedrock Embeddings**: `amazon.titan-embed-text-v2:0` (1024 dimensions)
- **MCP Server**: `knowledge_add / knowledge_update / knowledge_remove / knowledge_search`
- **Mastra Server**: JWT-protected (`MASTRA_JWT_SECRET`)

## Quick Start

### Requirements

- Node.js >= 20.9.0
- pnpm
- AWS account (S3 Vectors bucket)
- AWS IAM permissions for Bedrock
- **Amazon Bedrock Model Access Enabled**
  - Access the Bedrock service in the AWS Console and request access to the `amazon.titan-embed-text-v2:0` model to enable it
  - See [Bedrock Model Access Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) for details

### Installation

```bash
# Install dependencies
pnpm install

# CDK project (only if you plan to deploy)
cd cdk && pnpm install && cd -
```

### Local Run

```bash
# Copy .env.sample and configure environment variables
cp .env.sample .env
# Edit the .env file with your actual values

# Start development server
pnpm dev
# http://localhost:8080
```

## 📚 Documentation

See the complete documentation for details:

**[View Full Documentation →](https://tied-inc.github.io/mastra-s3-vector-rag/)**

- [Requirements](https://tied-inc.github.io/mastra-s3-vector-rag/setup/requirements/)
- [Creating S3 Vectors Bucket](https://tied-inc.github.io/mastra-s3-vector-rag/setup/s3-vectors/)
- [Environment Variables](https://tied-inc.github.io/mastra-s3-vector-rag/setup/environment/)
- [Local Development](https://tied-inc.github.io/mastra-s3-vector-rag/development/local/)
- [MCP Server](https://tied-inc.github.io/mastra-s3-vector-rag/development/mcp-server/)
- [Deploy with CDK](https://tied-inc.github.io/mastra-s3-vector-rag/deployment/cdk/)

## Documentation Development

Preview documentation locally:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start local server
pnpm docs:serve
# or
mkdocs serve
# http://localhost:8000
```

Build documentation:

```bash
pnpm docs:build
# or
mkdocs build
```

## Languages

- [日本語](README.md)
- [English](README_en.md)

## License

MIT
