# Requirements

Before you begin, ensure you have the following requirements:

## Software Requirements

- **Node.js**: Version 20.9.0 or higher
- **pnpm**: Package manager
- **Python**: Version 3.8 or higher (for documentation development with MkDocs)

## AWS Requirements

- **AWS Account**: Active AWS account with appropriate permissions
- **S3 Vectors Bucket**: Provisioned S3 Vectors bucket (see [S3 Vectors Setup](s3-vectors.md))
- **IAM Permissions for Bedrock**: Model access required for `amazon.titan-embed-text-v2:0`

## Initial Setup

```bash
# Install dependencies
pnpm install

# CDK project (only if you plan to deploy)
cd cdk && pnpm install && cd -
```

## Next Steps

- [Create an S3 Vectors Bucket](s3-vectors.md)
- [Configure Environment Variables](environment.md)
- [Start Local Development](../development/local.md)

