# Local Development

This guide covers how to run the application locally for development.

## Prerequisites

Before starting local development, ensure you have:

- Completed the [Setup Guide](../setup/requirements.md)
- Created an [S3 Vectors Bucket](../setup/s3-vectors.md)
- Configured [Environment Variables](../setup/environment.md)

## Step 1: Export Environment Variables

Set up the required environment variables:

```bash
export MASTRA_JWT_SECRET=dev-secret
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=ap-southeast-2    # match your bucket region and where Bedrock is available
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

!!! note "IAM Permissions"
    Ensure your IAM user/role has `bedrock:InvokeModel` permission for `amazon.titan-embed-text-v2:0`

## Step 2: Optional - Docker Compose Services

The included `compose.yml` starts DynamoDB Local and LocalStack(S3). It is not a local replacement for S3 Vectors, but can help with other Mastra storage development.

```bash
docker compose up -d
```

## Step 3: Start the Development Server

```bash
pnpm dev
# defaults to http://localhost:8080
```

The server will start with hot reload enabled. Any changes to the source code will automatically restart the server.

## Step 4: Production Build (Optional)

To test the production build locally:

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## API Testing

The Mastra server runs on port 8080 with JWT protection. For a quick health check:

```bash
curl http://localhost:8080/api
```

## Development Tips

### Hot Reload

The development server uses hot reload, so you can make changes to your code and see them reflected immediately without restarting the server.

### Debugging

To enable debug logging, set the `DEBUG` environment variable:

```bash
export DEBUG=mastra:*
pnpm dev
```

### Testing MCP Tools

To test the MCP tools, you can use the [MCP Server](#mcp-server-stdio) or integrate with Claude Desktop. See the [MCP Server guide](mcp-server.md) for details.

## Next Steps

- [MCP Server Configuration](mcp-server.md)
- [Deploy to AWS](../deployment/cdk.md)

