# ローカル開発

このガイドでは、開発のためにアプリケーションをローカルで実行する方法について説明します。

## 前提条件

ローカル開発を開始する前に、以下を確認してください：

- [セットアップガイド](../setup/requirements.md)を完了していること
- [S3 Vectorsバケット](../setup/s3-vectors.md)を作成していること
- [環境変数](../setup/environment.md)を設定していること

## ステップ1: 環境変数をエクスポート

必要な環境変数を設定します：

```bash
export MASTRA_JWT_SECRET=dev-secret
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=ap-southeast-2    # バケットのリージョンとBedrockが利用可能な場所に合わせる
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
```

!!! note "IAM権限"
    IAMユーザー/ロールが`amazon.titan-embed-text-v2:0`に対する`bedrock:InvokeModel`権限を持っていることを確認してください。

## ステップ2: Docker Composeサービス（オプション）

同梱の`compose.yml`はDynamoDB LocalとLocalStack(S3)を起動します。これはS3 Vectorsのローカル代替ではありませんが、他のMastraストレージ開発に役立ちます。

```bash
docker compose up -d
```

## ステップ3: 開発サーバーを起動

```bash
pnpm dev
# デフォルトは http://localhost:8080
```

サーバーはホットリロードが有効な状態で起動します。ソースコードへの変更は自動的にサーバーを再起動します。

## ステップ4: プロダクションビルド（オプション）

プロダクションビルドをローカルでテストするには：

```bash
# アプリケーションをビルド
pnpm build

# プロダクションサーバーを起動
pnpm start
```

## APIテスト

Mastraサーバーはポート8080でJWT保護で実行されます。簡易ヘルスチェックには：

```bash
curl http://localhost:8080/api
```

## 開発のヒント

### ホットリロード

開発サーバーはホットリロードを使用するため、コードを変更するとサーバーを再起動せずにすぐに反映されます。

### デバッグ

デバッグログを有効にするには、`DEBUG`環境変数を設定します：

```bash
export DEBUG=mastra:*
pnpm dev
```

### MCPツールのテスト

MCPツールをテストするには、[MCPサーバー](#mcpサーバーstdio)を使用するか、Claude Desktopと統合できます。詳細は[MCPサーバーガイド](mcp-server.md)を参照してください。

## 次のステップ

- [MCPサーバー設定](mcp-server.md)
- [AWSへデプロイ](../deployment/cdk.md)

