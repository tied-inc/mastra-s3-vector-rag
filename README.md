# mastra-s3-vector-rag

AWS S3 Vectorsをベクトルストアとして使用するMastraアプリケーションです。MCPサーバー経由でRAGツールを公開し、AWS Lambda（Function URL）にデプロイできます。

## 特徴

- **S3 Vectors**: ベクトルのCRUD/検索
- **Amazon Bedrock Embeddings**: `amazon.titan-embed-text-v2:0` (1024次元)
- **MCPサーバー**: `knowledge_add / knowledge_update / knowledge_remove / knowledge_search`
- **Mastraサーバー**: JWT保護（`MASTRA_JWT_SECRET`）

## クイックスタート

### 必要要件

- Node.js >= 20.9.0
- pnpm
- AWSアカウント（S3 Vectorsバケット）
- AWS IAM権限（Bedrock用）
- **Amazon Bedrockモデルアクセスの有効化**
  - AWSコンソールでBedrockサービスにアクセスし、`amazon.titan-embed-text-v2:0`モデルへのアクセスをリクエストして有効化してください
  - 詳細は[Bedrockモデルアクセスドキュメント](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)を参照

### インストール

```bash
# 依存関係をインストール
pnpm install

# CDKプロジェクト（デプロイする場合のみ）
cd cdk && pnpm install && cd -
```

### ローカル実行

```bash
# .env.sampleをコピーして環境変数を設定
cp .env.sample .env
# .envファイルを編集して実際の値を設定してください

# 開発サーバーを起動
pnpm dev
# http://localhost:8080
```

## 📚 ドキュメント

詳細なドキュメントは以下を参照してください：

**[完全なドキュメントを見る →](https://tied-inc.github.io/mastra-s3-vector-rag/)**

- [必要要件](https://tied-inc.github.io/mastra-s3-vector-rag/ja/setup/requirements/)
- [S3 Vectorsバケットの作成](https://tied-inc.github.io/mastra-s3-vector-rag/ja/setup/s3-vectors/)
- [環境変数の設定](https://tied-inc.github.io/mastra-s3-vector-rag/ja/setup/environment/)
- [ローカル開発](https://tied-inc.github.io/mastra-s3-vector-rag/ja/development/local/)
- [MCPサーバー](https://tied-inc.github.io/mastra-s3-vector-rag/ja/development/mcp-server/)
- [CDKでデプロイ](https://tied-inc.github.io/mastra-s3-vector-rag/ja/deployment/cdk/)

## ドキュメント開発

ドキュメントをローカルでプレビューする：

```bash
# Pythonの依存関係をインストール
pip install -r requirements.txt

# ローカルサーバーを起動
pnpm docs:serve
# または
mkdocs serve
# http://localhost:8000
```

ドキュメントをビルド：

```bash
pnpm docs:build
# または
mkdocs build
```

## 言語

- [日本語](README.md)
- [English](README_en.md)

## ライセンス

MIT
