# 必要要件

開始する前に、以下の要件を満たしていることを確認してください：

## ソフトウェア要件

- **Node.js**: バージョン 20.9.0 以上
- **pnpm**: パッケージマネージャー
- **Python**: バージョン 3.8 以上（MkDocsでドキュメント開発を行う場合）

## AWS 要件

- **AWS アカウント**: 適切な権限を持つアクティブなAWSアカウント
- **S3 Vectors バケット**: プロビジョニング済みのS3 Vectorsバケット（[S3 Vectorsセットアップ](s3-vectors.md)を参照）
- **Bedrock用IAM権限**: `amazon.titan-embed-text-v2:0`のモデルアクセスが必要

## 初期セットアップ

```bash
# 依存関係をインストール
pnpm install

# CDKプロジェクト（デプロイする場合のみ）
cd cdk && pnpm install && cd -
```

## 次のステップ

- [S3 Vectorsバケットの作成](s3-vectors.md)
- [環境変数の設定](environment.md)
- [ローカル開発を開始](../development/local.md)

