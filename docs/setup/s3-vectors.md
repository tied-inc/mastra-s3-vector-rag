# Creating an S3 Vectors Bucket

Before using this application, you need to create an S3 Vectors bucket in your AWS environment.

## Available Regions

S3 Vectors is currently in preview and available in the following regions:

- US East (N. Virginia) `us-east-1`
- US East (Ohio) `us-east-2`
- US West (Oregon) `us-west-2`
- Europe (Frankfurt) `eu-central-1`
- Asia Pacific (Sydney) `ap-southeast-2`

!!! info "Reference"
    For more information, see [Introducing Amazon S3 Vectors](https://aws.amazon.com/jp/blogs/news/introducing-amazon-s3-vectors-first-cloud-storage-with-native-vector-support-at-scale/)

## Create via Console

1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/)
2. In the left navigation pane, select **Vector buckets**
3. Select **Create vector bucket**
4. Enter a vector bucket name (e.g., `my-mastra-vectors`)
5. Choose encryption type:
   - **SSE-S3** (default): Amazon S3-managed keys
   - **SSE-KMS**: AWS KMS-managed keys
6. Select **Create vector bucket**

## Create via AWS CLI

```bash
# Set bucket name
VECTOR_BUCKET_NAME=my-mastra-vectors
AWS_REGION=ap-southeast-2

# Create vector bucket
aws s3vectors create-bucket \
  --bucket-name $VECTOR_BUCKET_NAME \
  --region $AWS_REGION
```

## Configure Bucket Information

After creation, set the following information as environment variables:

```bash
# Bucket name
export S3_VECTORS_BUCKET_NAME=my-mastra-vectors

# Bucket ARN (for CDK deployment)
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:ap-southeast-2:123456789012:bucket/my-mastra-vectors
```

!!! note "Bucket Limits"
    - Each vector bucket can contain up to 10,000 vector indexes
    - Each vector index can store tens of millions of vectors
    - Vector indexes are automatically created when first data is added via `knowledgeAddTool`

## Next Steps

- [Configure Environment Variables](environment.md)
- [Start Local Development](../development/local.md)

