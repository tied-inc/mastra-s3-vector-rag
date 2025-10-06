# S3 Vectorsバケットの作成

このアプリケーションを使用する前に、AWS環境でS3 Vectorsバケットを作成する必要があります。

## 利用可能なリージョン

S3 Vectorsは現在プレビュー段階で、以下のリージョンで利用可能です：

- 米国東部（バージニア北部） `us-east-1`
- 米国東部（オハイオ） `us-east-2`
- 米国西部（オレゴン） `us-west-2`
- ヨーロッパ（フランクフルト） `eu-central-1`
- アジアパシフィック（シドニー） `ap-southeast-2`

!!! info "参考"
    詳細については、[Amazon S3 Vectors の紹介](https://aws.amazon.com/jp/blogs/news/introducing-amazon-s3-vectors-first-cloud-storage-with-native-vector-support-at-scale/)を参照してください。

## コンソールから作成

1. [Amazon S3 コンソール](https://console.aws.amazon.com/s3/)を開く
2. 左側のナビゲーションペインで **Vector buckets** を選択
3. **Create vector bucket** を選択
4. ベクトルバケット名を入力（例: `my-mastra-vectors`）
5. 暗号化タイプを選択：
   - **SSE-S3**（デフォルト）: Amazon S3管理キー
   - **SSE-KMS**: AWS KMS管理キー
6. **Create vector bucket** を選択

## AWS CLIから作成

```bash
# バケット名を設定
VECTOR_BUCKET_NAME=my-mastra-vectors
AWS_REGION=ap-southeast-2

# ベクトルバケットを作成
aws s3vectors create-bucket \
  --bucket-name $VECTOR_BUCKET_NAME \
  --region $AWS_REGION
```

## バケット情報の確認

作成後、以下の情報を環境変数として設定します：

```bash
# バケット名
export S3_VECTORS_BUCKET_NAME=my-mastra-vectors

# バケットARN（CDKデプロイ用）
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:ap-southeast-2:123456789012:bucket/my-mastra-vectors
```

!!! note "バケットの制限"
    - 各ベクトルバケットには最大10,000個のベクトルインデックスを含めることができます
    - 各ベクトルインデックスには数千万個のベクトルを格納可能です
    - ベクトルインデックスは自動的に作成されます（`knowledgeAddTool`で最初のデータを追加時）

## 次のステップ

- [環境変数の設定](environment.md)
- [ローカル開発を開始](../development/local.md)

