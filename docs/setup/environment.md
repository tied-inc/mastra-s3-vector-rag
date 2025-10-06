# Environment Variables

This guide covers all environment variables required for running the application.

## Required Variables

### `MASTRA_JWT_SECRET`

Secret used for Mastra server JWT authentication.

```bash
export MASTRA_JWT_SECRET=dev-secret
```

!!! warning
    Use a strong, randomly generated secret in production environments.

### AWS Credentials

IAM credentials with access to S3 Vectors and Bedrock:

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

!!! note "IAM Permissions"
    Ensure your IAM user/role has `bedrock:InvokeModel` permission for `amazon.titan-embed-text-v2:0`

### `S3_VECTORS_BUCKET_NAME`

Required for local run. The name of your S3 Vectors bucket:

```bash
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

## Optional Variables

### `AWS_REGION`

AWS region where your resources are located. Defaults to `ap-southeast-2`:

```bash
export AWS_REGION=ap-southeast-2
```

!!! tip
    Match your bucket region and where Bedrock is available.

### `S3_VECTORS_BUCKET_ARN`

Used by CDK deploy. Full ARN of your S3 Vectors bucket:

```bash
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:ap-southeast-2:123456789012:bucket/my-mastra-vectors
```

## Example Configuration

Here's a complete example for local development:

```bash
# Mastra configuration
export MASTRA_JWT_SECRET=dev-secret

# AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=ap-southeast-2

# S3 Vectors bucket
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

## CDK Deployment Variables

Additional variables needed for CDK deployment:

```bash
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:<region>:<account>:bucket/<name>
export NODE_ENV=production
```

## Next Steps

- [Start Local Development](../development/local.md)
- [Deploy with CDK](../deployment/cdk.md)

