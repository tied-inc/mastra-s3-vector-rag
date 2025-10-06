# MCPサーバー

Model Context Protocol (MCP) サーバーは、AIアプリケーションにRAGツールを公開するための標準化された方法を提供します。

## MCPサーバーの起動

stdio経由で`knowledge`サーバーを起動：

```bash
pnpm run mcp:knowledge:stdio
```

## 利用可能なツール

MCPサーバーは以下のツールを公開しています：

### `knowledge_add`

ドキュメントのチャンク化、埋め込み生成、ベクトルストアへのアップサート。

**パラメータ:**
- `content`: 追加するドキュメントの内容
- `metadata`: オプションのメタデータオブジェクト
- `chunkSize`: オプションのチャンクサイズ（デフォルト: 1000）
- `chunkOverlap`: オプションのチャンクオーバーラップ（デフォルト: 200）

**例:**
```json
{
  "content": "ここにドキュメントの内容...",
  "metadata": {
    "source": "example.pdf",
    "page": 1
  }
}
```

### `knowledge_update`

IDによるベクトルとメタデータの更新。

**パラメータ:**
- `id`: 更新するベクトルID
- `content`: 新しい内容
- `metadata`: オプションの新しいメタデータ

### `knowledge_remove`

IDによるベクトルの削除。

**パラメータ:**
- `ids`: 削除するベクトルIDの配列

**例:**
```json
{
  "ids": ["vec_123", "vec_456"]
}
```

### `knowledge_search`

オプションのメタデータフィルタ付きセマンティック検索。

**パラメータ:**
- `query`: 検索クエリテキスト
- `topK`: 返す結果の数（デフォルト: 5）
- `metadataFilter`: オプションのメタデータフィルタオブジェクト

**例:**
```json
{
  "query": "S3 Vectorsとは何ですか？",
  "topK": 5,
  "metadataFilter": {
    "source": "example.pdf"
  }
}
```

## 設定

### インデックス設定

- **デフォルトインデックス名**: `knowledge`
- **埋め込み次元**: 1024 (Amazon Bedrock Titan)
- **デフォルトチャンクサイズ**: 1000文字
- **デフォルトチャンクオーバーラップ**: 200文字

### 環境変数

以下の環境変数が設定されていることを確認してください：

```bash
export S3_VECTORS_BUCKET_NAME=your-s3vectors-bucket
export AWS_REGION=ap-southeast-2
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

## Claude Desktopとの統合

このMCPサーバーをClaude Desktopで使用するには、Claude Desktopの設定に以下を追加します：

```json
{
  "mcpServers": {
    "knowledge": {
      "command": "pnpm",
      "args": ["run", "mcp:knowledge:stdio"],
      "cwd": "/path/to/mastra-s3-vector-rag"
    }
  }
}
```

## 実装ファイル

- サーバー: `src/mastra/mcp/knowledge-server.ts`
- Stdioラッパー: `src/mastra/mcp/knowledge-stdio.ts`
- RAGツール: `src/mastra/tools/knowledge.ts`

## 次のステップ

- [AWSへデプロイ](../deployment/cdk.md)
- [APIリファレンス](../api/reference.md)

