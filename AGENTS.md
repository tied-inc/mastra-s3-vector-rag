# mastra-s3-vector-rag リポジトリ保守ガイド

## 概要

このリポジトリは、AWS S3 Vectorsをベクトルストアとして使用するRAG (Retrieval-Augmented Generation) アプリケーションです。Mastraフレームワークを使用し、MCPサーバーとして動作します。

## アーキテクチャ

### 主要コンポーネント
- **Mastraサーバー**: ポート8080で動作、JWT認証保護
- **MCPサーバー**: Model Context Protocolに準拠した知識ベースサーバー
- **ベクトルストア**: AWS S3 Vectors (プレビュー版)
- **埋め込みモデル**: Amazon Bedrock `amazon.titan-embed-text-v2:0` (1024次元)
- **デプロイ**: AWS Lambda + Function URL (AWS CDK)

### デプロイアーキテクチャ
```
[Client] → [Lambda Function URL] → [Lambda (Docker)] → [S3 Vectors + Bedrock]
```

## 技術スタック

### ランタイム
- **Node.js**: >= 20.9.0
- **パッケージマネージャー**: pnpm
- **TypeScript**: 5.9.2

### 主要フレームワーク・ライブラリ
- `@mastra/core`: Mastraフレームワークのコア
- `@mastra/s3vectors`: S3 Vectorsベクトルストア連携
- `@mastra/rag`: RAG機能
- `@mastra/mcp`: MCPサーバー機能
- `@mastra/auth`: JWT認証
- `@ai-sdk/amazon-bedrock`: Amazon Bedrock連携
- `ai`: Vercel AI SDK

### インフラ
- **AWS CDK**: 2.158.0
- **Docker**: マルチステージビルド
- **AWS Lambda Adapter**: Lambda環境でHTTPサーバーを実行

### 開発ツール
- **Biome**: リンター・フォーマッター
- **Lefthook**: Git hook管理
- **tsx**: TypeScript実行環境

## ディレクトリ構成

```
mastra-s3-vector-rag/
├── src/mastra/              # Mastraアプリケーション
│   ├── index.ts            # Mastraサーバー設定（エントリーポイント）
│   ├── mcp/                # MCPサーバー実装
│   │   ├── knowledge-server.ts  # HTTPサーバー版
│   │   └── knowledge-stdio.ts   # stdio版
│   └── tools/              # RAGツール実装
│       └── knowledge.ts    # add/update/remove/search
├── cdk/                    # AWS CDKインフラコード
│   ├── bin/app.ts          # CDKアプリエントリーポイント
│   └── lib/mastra-stack.ts # Lambda + Function URLスタック定義
├── tests/                  # テストコード
│   └── e2e.test.ts         # E2Eテスト
├── Dockerfile              # Lambda用Dockerイメージ
├── compose.yml             # ローカル開発用（DynamoDB + LocalStack）
├── lefthook.yml            # pre-commitフック（Biome）
├── biome.json              # Biome設定
└── README*.md              # ドキュメント（日英）
```

## 重要な環境変数

### ランタイム必須
- `MASTRA_JWT_SECRET`: JWT認証シークレット
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: AWS認証情報
- `S3_VECTORS_BUCKET_NAME`: S3 Vectorsバケット名
- `AWS_REGION`: AWSリージョン（デフォルト: ap-southeast-2）

### CDKデプロイ時必須
- `CDK_DEFAULT_ACCOUNT`: AWSアカウントID
- `CDK_DEFAULT_REGION`: デプロイ先リージョン
- `S3_VECTORS_BUCKET_ARN`: S3 VectorsバケットのARN
- `S3_VECTORS_BUCKET_NAME`: S3 Vectorsバケット名
- `MASTRA_JWT_SECRET`: 本番用JWTシークレット
- `NODE_ENV`: production推奨

## 開発ワークフロー

### ローカル開発
```bash
# 依存関係インストール
pnpm install

# 環境変数設定
export MASTRA_JWT_SECRET=dev-secret
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_REGION=ap-southeast-2
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket

# 開発サーバー起動
pnpm dev
```

### MCPサーバー（stdio）
```bash
pnpm run mcp:knowledge:stdio
```

### ビルド・本番実行
```bash
pnpm build  # .mastraディレクトリにビルド
pnpm start
```

### CDKデプロイ
```bash
cd cdk
pnpm install

# 環境変数設定
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:...
export S3_VECTORS_BUCKET_NAME=...
export MASTRA_JWT_SECRET=prod-secret
export NODE_ENV=production

# デプロイ
pnpm run deploy
```

## AWS権限要件

### IAMポリシー（Lambda実行ロール）
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3vectors:CreateIndex",
        "s3vectors:GetIndex",
        "s3vectors:ListIndexes",
        "s3vectors:PutVectors",
        "s3vectors:GetVectors",
        "s3vectors:DeleteVectors",
        "s3vectors:QueryVectors",
        "s3vectors:ListVectors"
      ],
      "Resource": [
        "arn:aws:s3vectors:REGION:ACCOUNT:bucket/BUCKET_NAME",
        "arn:aws:s3vectors:REGION:ACCOUNT:bucket/BUCKET_NAME/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:REGION::foundation-model/amazon.titan-embed-text-v2:0"
    }
  ]
}
```

## S3 Vectors前提知識

### 利用可能リージョン（プレビュー段階）
- us-east-1, us-east-2, us-west-2
- eu-central-1
- ap-southeast-2

### 制限事項
- バケット単位で最大10,000個のベクトルインデックス
- インデックス単位で数千万個のベクトル
- インデックスは初回データ追加時に自動作成

### 作成方法
```bash
aws s3vectors create-bucket \
  --bucket-name my-mastra-vectors \
  --region ap-southeast-2
```

## コード品質管理

### Lefthook（pre-commit）
- 対象: `src/**/*.ts`
- 実行: `pnpm biome format` + `pnpm biome check`
- 自動修正: `stage_fixed: true`

### Biome設定
`biome.json`でフォーマット・リントルールを管理

## トラブルシューティング

### S3 Vectors関連エラー
- **IndexNotFoundException**: インデックスが未作成 → 最初のデータ追加時に自動作成されるため、知識ベースが空の場合は検索エラー
- **AccessDenied**: IAM権限不足 → 上記権限要件を確認
- **UnsupportedRegion**: 対応リージョン外 → サポートリージョンを使用

### Bedrock関連エラー
- **AccessDenied**: モデルアクセス未許可 → Bedrockコンソールでモデルアクセスリクエスト
- **ThrottlingException**: レート制限 → クォータ引き上げリクエスト

### Lambda Adapter
- デフォルトポート: 8080
- ヘルスチェックパス: `/api`
- タイムアウト: 900秒（CDK設定）

## ドキュメント管理ルール

**重要**: README は日本語（`README.md`）と英語（`README_en.md`）の両方を保守し、内容は常に同期すること。

## テスト

```bash
pnpm test  # tsx --test で実行
```

## リリースプロセス

1. 機能開発・修正
2. Biome チェック（Lefthook自動実行）
3. テスト実行
4. README更新（日英同期）
5. CDKデプロイ（ステージング → 本番）

## 参考リンク

- [Mastraドキュメント](https://mastra.ai/docs)
- [AWS S3 Vectors紹介記事](https://aws.amazon.com/jp/blogs/news/introducing-amazon-s3-vectors-first-cloud-storage-with-native-vector-support-at-scale/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)