# Mastra S3 Vector RAG

**Mastra S3 Vector RAG** のドキュメントへようこそ！

このMastraアプリは、AWS S3 Vectorsをベクトルストアとして使用しています。MCPサーバー経由でRAGツール（追加、更新、削除、検索）を公開し、ポート8080でMastraサーバーを実行します。CDKを使用してAWS Lambda（Function URL）にデプロイできます。

## 機能

- **S3 Vectors**: インデックスのライフサイクル管理とベクトルのCRUD/検索
- **Amazon Bedrock Embeddings**: `amazon.titan-embed-text-v2:0` (1024次元)
- **MCPサーバー**: `knowledge_add / knowledge_update / knowledge_remove / knowledge_search`
- **Mastraサーバー**: JWT保護（`MASTRA_JWT_SECRET`）

## クイックリンク

- [必要要件](setup/requirements.md)
- [セットアップガイド](setup/s3-vectors.md)
- [ローカル開発](development/local.md)
- [デプロイ](deployment/cdk.md)
- [MCPクライアントでの利用](usage/mcp-clients.md)

## 実装メモ

- サーバー: `src/mastra/index.ts` (ポート8080、JWT必須)
- MCP: `src/mastra/mcp/knowledge-server.ts` / `knowledge-stdio.ts`
- RAGツール: `src/mastra/tools/knowledge.ts`
  - デフォルトインデックス: `knowledge`
  - 埋め込み: Amazon Bedrock `amazon.titan-embed-text-v2:0` (1024次元)
  - 主要な環境変数: `S3_VECTORS_BUCKET_NAME`、`AWS_REGION` (デフォルト `ap-southeast-2`)
  - 必要なAWS権限: Titan埋め込みモデルの`bedrock:InvokeModel`

## ライセンス

MIT

