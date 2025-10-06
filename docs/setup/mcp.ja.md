# Model Context Protocol (MCP)

## MCPとは

Model Context Protocol (MCP) は、AIアプリケーションがツールやデータソースと統合するための標準化されたプロトコルです。MCPを使用することで、AIモデル（Claude、GPT、その他のLLM）が外部システムと安全かつ標準的な方法でやり取りできるようになります。

## このプロジェクトにおけるMCPの役割

このプロジェクトでは、MCPサーバーを使用してRAG（Retrieval-Augmented Generation）機能をAIクライアントに公開しています：

```
[AIクライアント] ←→ [MCPサーバー] ←→ [S3 Vectors + Bedrock]
(Claude Desktop等)    (knowledge)      (ベクトルストア + 埋め込み)
```

### 主な利点

1. **標準化**: 様々なAIクライアント（Claude Desktop、Cursor、その他MCP対応ツール）から同じインターフェースで利用可能
2. **セキュリティ**: AWS認証情報などの機密情報をクライアント側で管理する必要がない
3. **再利用性**: 一度実装すれば、複数のAIアプリケーションから利用可能
4. **拡張性**: 新しいツールや機能を簡単に追加可能

## MCPの仕組み

### 通信方法

MCPサーバーは2つの通信モードをサポートします：

#### 1. stdio（標準入出力）
ローカル環境で使用。AIクライアントがサーバープロセスを起動し、標準入出力で通信します。

```bash
# このプロジェクトのstdio起動コマンド
pnpm run mcp:knowledge:stdio
```

#### 2. HTTP
ネットワーク経由での通信。Lambda Function URLなどでリモート公開する場合に使用します。

### プロトコルフロー

1. **初期化**: クライアントがサーバーに接続し、利用可能なツール一覧を取得
2. **ツール呼び出し**: AIがツールを実行したいとき、クライアントがサーバーにリクエスト送信
3. **実行**: サーバーがツールを実行（S3 Vectorsへの検索など）
4. **応答**: 結果をクライアントに返し、AIが内容を理解して応答生成

## このプロジェクトで提供されるMCPツール

このプロジェクトのMCPサーバー `knowledge` は、以下の4つのツールを提供します：

| ツール | 機能 | 用途 |
|--------|------|------|
| `knowledge_add` | ドキュメント追加 | テキストをチャンク化し、埋め込みを生成してベクトルストアに保存 |
| `knowledge_update` | ドキュメント更新 | 既存ベクトルの内容やメタデータを更新 |
| `knowledge_remove` | ドキュメント削除 | 指定IDのベクトルを削除 |
| `knowledge_search` | セマンティック検索 | 自然言語クエリで関連ドキュメントを検索 |

これらのツールにより、AIクライアントは知識ベースの管理と検索を対話的に実行できます。

## MCP対応クライアント

このMCPサーバーは、以下のようなMCP対応クライアントで使用できます：

- **Claude Desktop**: Anthropic公式デスクトップアプリ
- **Cursor**: AI統合開発環境
- **その他**: MCP標準に準拠したあらゆるAIクライアント

## 技術仕様

### 実装フレームワーク

このプロジェクトでは **Mastra** フレームワークの `@mastra/mcp` パッケージを使用してMCPサーバーを実装しています。

```typescript
import { MCPServer } from "@mastra/mcp";

export const knowledgeMcpServer = new MCPServer({
  name: "knowledge",
  version: "0.1.0",
  tools: {
    knowledge_add: knowledgeAddTool,
    knowledge_search: knowledgeSearchTool,
    // ...
  },
});
```

### ツール定義

各ツールは以下の要素で定義されます：

- **スキーマ**: 入力パラメータの型定義（Zod使用）
- **説明**: AIがツールの用途を理解するための説明文
- **実行関数**: 実際の処理を行う非同期関数

## セキュリティ考慮事項

### 認証情報の管理

MCPサーバーはサーバー側で以下の認証情報を管理します：

- AWS認証情報（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`）
- S3 Vectorsバケット名
- Bedrockモデルアクセス権限

クライアント側ではこれらの情報を持つ必要がないため、セキュリティリスクが軽減されます。

### ネットワーク公開時の注意

Lambda Function URLなどでHTTPモードで公開する場合、追加のセキュリティ対策が必要です：

- JWT認証（このプロジェクトでは `@mastra/auth` を使用）
- IAM認証
- API Gatewayによるレート制限
- VPC内での実行

## 次のステップ

MCPサーバーの実際の使い方について、以下のドキュメントを参照してください：

- [MCPサーバーの起動と使用方法](../development/mcp-server.md)
- [MCPクライアントでの利用例](../usage/mcp-clients.md)
- [環境変数の設定](environment.md)

## 参考リンク

- [Model Context Protocol 公式サイト](https://modelcontextprotocol.io/)
- [Mastra MCP ドキュメント](https://mastra.ai/docs/tools-mcp/)
- [Claude Desktop MCP設定](https://docs.anthropic.com/claude/docs/model-context-protocol)

