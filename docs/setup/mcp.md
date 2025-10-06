# Model Context Protocol (MCP)

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol for integrating AI applications with tools and data sources. By using MCP, AI models (Claude, GPT, and other LLMs) can interact with external systems in a safe and standardized manner.

## Role of MCP in This Project

This project uses an MCP server to expose RAG (Retrieval-Augmented Generation) capabilities to AI clients:

```
[AI Client] ←→ [MCP Server] ←→ [S3 Vectors + Bedrock]
(Claude Desktop, etc.)  (knowledge)  (Vector Store + Embeddings)
```

### Key Benefits

1. **Standardization**: Available from various AI clients (Claude Desktop, Cursor, and other MCP-compatible tools) through the same interface
2. **Security**: No need to manage sensitive information like AWS credentials on the client side
3. **Reusability**: Once implemented, it can be used by multiple AI applications
4. **Extensibility**: Easy to add new tools and features

## How MCP Works

### Communication Methods

The MCP server supports two communication modes:

#### 1. stdio (Standard Input/Output)
Used in local environments. The AI client launches the server process and communicates through standard input/output.

```bash
# This project's stdio startup command
pnpm run mcp:knowledge:stdio
```

#### 2. HTTP
Communication over the network. Used when exposing remotely via Lambda Function URLs, etc.

### Protocol Flow

1. **Initialization**: Client connects to the server and retrieves the list of available tools
2. **Tool Invocation**: When AI wants to execute a tool, the client sends a request to the server
3. **Execution**: Server executes the tool (e.g., search in S3 Vectors)
4. **Response**: Returns results to the client, and AI understands the content to generate a response

## MCP Tools Provided by This Project

The `knowledge` MCP server in this project provides four tools:

| Tool | Function | Purpose |
|------|----------|---------|
| `knowledge_add` | Add documents | Chunk text, generate embeddings, and save to vector store |
| `knowledge_update` | Update documents | Update content or metadata of existing vectors |
| `knowledge_remove` | Delete documents | Delete vectors by specified IDs |
| `knowledge_search` | Semantic search | Search for relevant documents using natural language queries |

These tools enable AI clients to interactively manage and search the knowledge base.

## MCP-Compatible Clients

This MCP server can be used with MCP-compatible clients such as:

- **Claude Desktop**: Official Anthropic desktop application
- **Cursor**: AI-integrated development environment
- **Others**: Any AI client that complies with the MCP standard

## Technical Specifications

### Implementation Framework

This project uses the `@mastra/mcp` package from the **Mastra** framework to implement the MCP server.

```typescript
import { MCPServer } from "@mastra/mcp";

export const knowledgeMcpServer = new MCPServer({
  name: "knowledge",
  version: "0.1.0",
  tools: {
    knowledge_add: knowledgeAddTool,
    knowledge_search: knowledgeSearchTool,
    // ...
  },
});
```

### Tool Definition

Each tool is defined with the following elements:

- **Schema**: Type definition for input parameters (using Zod)
- **Description**: Explanatory text for AI to understand the tool's purpose
- **Execute Function**: Asynchronous function that performs the actual processing

## Security Considerations

### Credential Management

The MCP server manages the following credentials on the server side:

- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- S3 Vectors bucket name
- Bedrock model access permissions

Since the client side doesn't need to hold this information, security risks are mitigated.

### Considerations for Network Exposure

When exposing in HTTP mode via Lambda Function URLs, etc., additional security measures are needed:

- JWT authentication (this project uses `@mastra/auth`)
- IAM authentication
- Rate limiting via API Gateway
- Execution within VPC

## Next Steps

For information on how to actually use the MCP server, refer to the following documentation:

- [Starting and Using the MCP Server](../development/mcp-server.md)
- [Usage Examples with MCP Clients](../usage/mcp-clients.md)
- [Environment Variable Configuration](environment.md)

## References

- [Model Context Protocol Official Site](https://modelcontextprotocol.io/)
- [Mastra MCP Documentation](https://mastra.ai/docs/tools-mcp/)
- [Claude Desktop MCP Configuration](https://docs.anthropic.com/claude/docs/model-context-protocol)

