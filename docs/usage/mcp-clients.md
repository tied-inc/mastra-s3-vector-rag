# Using with MCP Clients

This guide explains how to use the deployed MCP server from clients like Cursor and Claude Code.

## Overview

This Mastra app provides an HTTP-based MCP server deployed on AWS Lambda. MCP clients (Cursor, Claude Code, etc.) can call RAG tools (`knowledge_add`, `knowledge_update`, `knowledge_remove`, `knowledge_search`) via the Function URL.

## Required Information

After deployment, you'll need:

1. **Function URL**: Retrieved from CDK deployment output
   ```bash
   MastraStack.FunctionUrl = https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/
   ```

2. **JWT Secret**: The value of `MASTRA_JWT_SECRET` set during deployment

3. **JWT Token**: A token generated from the JWT Secret (see below)

## Generating JWT Token

The MCP server is protected with JWT authentication, so you need a JWT token to access it.

### Example with Node.js

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

const secret = 'your-jwt-secret'; // Same as MASTRA_JWT_SECRET
const token = jwt.sign(
  {
    sub: 'user-id',
    name: 'User Name',
  },
  secret,
  {
    expiresIn: '30d', // Expiration
  }
);

console.log(token);
```

### Example with Python

```bash
pip install pyjwt
```

```python
import jwt
from datetime import datetime, timedelta

secret = 'your-jwt-secret'  # Same as MASTRA_JWT_SECRET
payload = {
    'sub': 'user-id',
    'name': 'User Name',
    'exp': datetime.utcnow() + timedelta(days=30)  # Expiration
}

token = jwt.encode(payload, secret, algorithm='HS256')
print(token)
```

### Using Online Tools

You can also use online tools like [jwt.io](https://jwt.io/):

1. Set Algorithm to `HS256`
2. Set Payload:
   ```json
   {
     "sub": "user-id",
     "name": "User Name",
     "exp": 1735689600
   }
   ```
3. Enter your `MASTRA_JWT_SECRET` in the Verify Signature field
4. Copy the generated token

!!! warning "Security"
    In production environments, manage JWT tokens securely. If a token is leaked, third parties can access your MCP server.

## Cursor Configuration

### Configuration File Location

Create `.cursor/mcp.json` in your project root:

```bash
mkdir -p .cursor
```

### Configuration Example

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mastra-knowledge": {
      "transport": {
        "type": "http",
        "url": "https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/mcp/v1/knowledge",
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    }
  }
}
```

!!! note "URL Structure"
    - Base URL: `{Function URL}` (without trailing slash)
    - MCP endpoint: `/mcp/v1/{mcpServerName}`
    - In this example: `/mcp/v1/knowledge`

### Verifying Configuration

1. Restart Cursor
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Search for "MCP: Show Connected Servers"
4. Verify that `mastra-knowledge` is displayed

### Using Tools

You can use the tools in chat:

```
Use knowledge_search to search for information about "AWS S3"
```

```
Use knowledge_add to add new information:
Title: AWS Lambda
Content: AWS Lambda is a serverless computing service...
```

## Claude Desktop (Claude Code) Configuration

### Configuration File Location

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux**:
```
~/.config/Claude/claude_desktop_config.json
```

### Configuration Example

```json
{
  "mcpServers": {
    "mastra-knowledge": {
      "transport": {
        "type": "http",
        "url": "https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/mcp/v1/knowledge",
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    }
  }
}
```

### Verifying Configuration

1. Restart Claude Desktop
2. Click the 🔌 icon in the chat interface
3. Verify that `mastra-knowledge` is connected
4. Check that available tools (`knowledge_add`, `knowledge_search`, etc.) are displayed

## Troubleshooting

### Connection Error

**Symptom**: "Failed to connect to MCP server"

**Causes and Solutions**:

- Verify the Function URL is correct
- Ensure there's no trailing slash in the URL (`/` is not needed)
- Check that the MCP endpoint path `/mcp/v1/knowledge` is correct

### Authentication Error

**Symptom**: "401 Unauthorized" or "403 Forbidden"

**Causes and Solutions**:

- Verify the JWT token is correct
- Check that the JWT token hasn't expired
- Ensure the format `Authorization: Bearer {token}` is correct (space after `Bearer` is required)
- Confirm the JWT Secret matches the one used during deployment (`MASTRA_JWT_SECRET`)

### Timeout Error

**Symptom**: "Request timeout"

**Causes and Solutions**:

- First requests may be slow due to Lambda cold starts
- Large data additions/searches may take time
- Check the Lambda function timeout setting (default 900 seconds)

### Tools Not Showing

**Symptom**: MCP server is connected but tools are unavailable

**Causes and Solutions**:

- Restart the client
- Verify the JSON format of the configuration file is correct
- Ensure the Function URL ends with `/mcp/v1/knowledge`

## Next Steps

- [Local Development](../development/local.md): Test the MCP server locally
- [Deployment](../deployment/cdk.md): How to deploy with CDK
- [MCP Server](../development/mcp-server.md): MCP server details

