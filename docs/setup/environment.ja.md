# 環境変数

このガイドでは、アプリケーションの実行に必要なすべての環境変数について説明します。

## 必須変数

### `MASTRA_JWT_SECRET`

Mastraサーバーのjwt認証に使用されるシークレット：

```bash
export MASTRA_JWT_SECRET=dev-secret
```

!!! warning "注意"
    本番環境では、強力でランダムに生成されたシークレットを使用してください。

### AWS 認証情報

S3 VectorsとBedrockへのアクセス権限を持つIAM認証情報：

```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

!!! note "IAM権限"
    IAMユーザー/ロールが`amazon.titan-embed-text-v2:0`に対する`bedrock:InvokeModel`権限を持っていることを確認してください。

### `S3_VECTORS_BUCKET_NAME`

ローカル実行に必須。S3 Vectorsバケット名：

```bash
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

## オプション変数

### `AWS_REGION`

リソースが配置されているAWSリージョン。デフォルトは`ap-southeast-2`：

```bash
export AWS_REGION=ap-southeast-2
```

!!! tip "ヒント"
    バケットのリージョンとBedrockが利用可能な場所に合わせてください。

### `S3_VECTORS_BUCKET_ARN`

CDKデプロイで使用。S3 VectorsバケットのフルARN：

```bash
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:ap-southeast-2:123456789012:bucket/my-mastra-vectors
```

## 設定例

ローカル開発用の完全な設定例：

```bash
# Mastra設定
export MASTRA_JWT_SECRET=dev-secret

# AWS認証情報
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=ap-southeast-2

# S3 Vectorsバケット
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

## CDKデプロイ用変数

CDKデプロイに必要な追加変数：

```bash
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:<region>:<account>:bucket/<name>
export NODE_ENV=production
```

## 次のステップ

- [ローカル開発を開始](../development/local.md)
- [CDKでデプロイ](../deployment/cdk.md)

