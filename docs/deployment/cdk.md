# Deploy with CDK (Lambda + Function URL)

This guide covers deploying the application to AWS Lambda using CDK (Cloud Development Kit).

## Prerequisites

Before deploying, ensure you have:

- AWS CDK installed globally
- AWS credentials configured
- S3 Vectors bucket created
- Required environment variables set

## Step 1: Install CDK

Install AWS CDK globally if you haven't already:

```bash
npm i -g aws-cdk
```

Install CDK project dependencies:

```bash
cd cdk && pnpm install && cd -
```

## Step 2: Configure Environment Variables

Set up the required environment variables for deployment:

```bash
# AWS account and region
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2        # choose your region

# S3 Vectors bucket ARN
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:<region>:<account>:bucket/<name>

# Mastra configuration
export MASTRA_JWT_SECRET=prod-secret
export NODE_ENV=production
```

!!! warning "Production Secret"
    Make sure to use a strong, randomly generated secret for `MASTRA_JWT_SECRET` in production.

## Step 3: Bootstrap (First Time Only)

If this is your first time using CDK in this AWS account/region combination, you need to bootstrap:

```bash
cd cdk
pnpm run cdk bootstrap
```

## Step 4: Deploy

Deploy the stack:

```bash
pnpm run deploy
```

The deployment will:

1. Build the application
2. Create a Lambda function
3. Set up a Function URL
4. Configure IAM permissions for S3 Vectors and Bedrock
5. Set environment variables

## Step 5: Test the Deployment

After deployment, CDK will output a `FunctionUrl`. Test it with a health check:

```bash
curl https://your-function-url.lambda-url.ap-southeast-2.on.aws/api
```

## Architecture

The deployed stack includes:

- **Lambda Function**: Runs the Mastra server
- **Function URL**: Public HTTP endpoint with IAM authentication
- **IAM Role**: Permissions for S3 Vectors and Bedrock access
- **Environment Variables**: Runtime configuration

## Environment Variables Passed to Lambda

The following environment variables are automatically configured in the Lambda:

- `S3_VECTORS_BUCKET_ARN`: S3 Vectors bucket ARN
- `MASTRA_JWT_SECRET`: JWT secret for authentication
- `AWS_REGION`: AWS region (automatically set by Lambda)

!!! note "Bucket Name vs ARN"
    The default stack passes `S3_VECTORS_BUCKET_ARN` to the Lambda. If your runtime also needs the bucket name, extend the CDK stack to pass `S3_VECTORS_BUCKET_NAME` as an additional environment variable in `cdk/lib/mastra-stack.ts`.

## Updating the Deployment

To update an existing deployment with new code or configuration:

```bash
cd cdk
pnpm run deploy
```

## Destroying the Stack

To remove all resources created by the stack:

```bash
cd cdk
pnpm run cdk destroy
```

!!! warning "Data Loss"
    This will destroy the Lambda function and related resources, but will not delete your S3 Vectors bucket.

## Troubleshooting

### Deployment Fails

- Check that all environment variables are set correctly
- Verify your AWS credentials have sufficient permissions
- Ensure the S3 Vectors bucket exists and the ARN is correct

### Lambda Function Errors

- Check CloudWatch Logs for error messages
- Verify IAM permissions for Bedrock and S3 Vectors
- Ensure the bucket name is correctly extracted from the ARN in your code

## Next Steps

- [Monitor with CloudWatch](monitoring.md)
- [Configure Custom Domain](custom-domain.md)
- [Scale and Optimize](optimization.md)

