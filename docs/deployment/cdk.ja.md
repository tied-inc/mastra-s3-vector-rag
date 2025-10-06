# CDKでデプロイ（Lambda + Function URL）

このガイドでは、CDK（Cloud Development Kit）を使用してアプリケーションをAWS Lambdaにデプロイする方法について説明します。

## 前提条件

デプロイする前に、以下を確認してください：

- AWS CDKがグローバルにインストールされていること
- AWS認証情報が設定されていること
- S3 Vectorsバケットが作成されていること
- 必要な環境変数が設定されていること

## ステップ1: CDKのインストール

まだインストールしていない場合は、AWS CDKをグローバルにインストールします：

```bash
npm i -g aws-cdk
```

CDKプロジェクトの依存関係をインストール：

```bash
cd cdk && pnpm install && cd -
```

## ステップ2: 環境変数の設定

デプロイに必要な環境変数を設定します：

```bash
# AWSアカウントとリージョン
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export CDK_DEFAULT_REGION=ap-southeast-2        # リージョンを選択

# S3 VectorsバケットARN
export S3_VECTORS_BUCKET_ARN=arn:aws:s3vectors:<region>:<account>:bucket/<name>

# Mastra設定
export MASTRA_JWT_SECRET=prod-secret
export NODE_ENV=production
```

!!! warning "本番環境のシークレット"
    本番環境では、`MASTRA_JWT_SECRET`に強力でランダムに生成されたシークレットを使用してください。

## ステップ3: ブートストラップ（初回のみ）

このAWSアカウント/リージョンの組み合わせでCDKを初めて使用する場合は、ブートストラップが必要です：

```bash
cd cdk
pnpm run cdk bootstrap
```

## ステップ4: デプロイ

スタックをデプロイ：

```bash
pnpm run deploy
```

デプロイでは以下が実行されます：

1. アプリケーションのビルド
2. Lambda関数の作成
3. Function URLの設定
4. S3 VectorsとBedrock用のIAM権限の設定
5. 環境変数の設定

## ステップ5: デプロイのテスト

デプロイ後、CDKは`FunctionUrl`を出力します。ヘルスチェックでテスト：

```bash
curl https://your-function-url.lambda-url.ap-southeast-2.on.aws/api
```

## アーキテクチャ

デプロイされたスタックには以下が含まれます：

- **Lambda関数**: Mastraサーバーを実行
- **Function URL**: IAM認証付きのパブリックHTTPエンドポイント
- **IAMロール**: S3 VectorsとBedrockアクセスの権限
- **環境変数**: ランタイム設定

## Lambdaに渡される環境変数

以下の環境変数はLambdaで自動的に設定されます：

- `S3_VECTORS_BUCKET_ARN`: S3 VectorsバケットARN
- `MASTRA_JWT_SECRET`: 認証用のJWTシークレット
- `AWS_REGION`: AWSリージョン（Lambdaによって自動設定）

!!! note "バケット名 vs ARN"
    デフォルトのスタックは`S3_VECTORS_BUCKET_ARN`をLambdaに渡します。ランタイムでバケット名が必要な場合は、`cdk/lib/mastra-stack.ts`のLambdaの`environment`に`S3_VECTORS_BUCKET_NAME`を追加の環境変数として渡すようにCDKスタックを拡張してください。

## デプロイの更新

新しいコードや設定で既存のデプロイを更新するには：

```bash
cd cdk
pnpm run deploy
```

## スタックの削除

スタックによって作成されたすべてのリソースを削除するには：

```bash
cd cdk
pnpm run cdk destroy
```

!!! warning "データ損失"
    これによりLambda関数と関連リソースが破棄されますが、S3 Vectorsバケットは削除されません。

## トラブルシューティング

### デプロイが失敗する

- すべての環境変数が正しく設定されているか確認
- AWS認証情報に十分な権限があるか確認
- S3 Vectorsバケットが存在し、ARNが正しいか確認

### Lambda関数のエラー

- CloudWatch Logsでエラーメッセージを確認
- BedrockとS3 Vectors用のIAM権限を確認
- コード内でARNからバケット名が正しく抽出されているか確認

## 次のステップ

- [CloudWatchで監視](monitoring.md)
- [カスタムドメインの設定](custom-domain.md)
- [スケールと最適化](optimization.md)

