# MCPクライアントでの利用

デプロイされたMCPサーバーをCursorやClaude Codeなどのクライアントから利用する方法を説明します。

## 概要

このMastraアプリは、AWS LambdaにデプロイされたHTTPベースのMCPサーバーを提供します。MCPクライアント（CursorやClaude Code）から、Function URL経由でRAGツール（`knowledge_add`, `knowledge_update`, `knowledge_remove`, `knowledge_search`）を呼び出すことができます。

## 必要な情報

デプロイ後、以下の情報が必要です：

1. **Function URL**: CDKデプロイ時の出力から取得
   ```bash
   MastraStack.FunctionUrl = https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/
   ```

2. **JWT Secret**: デプロイ時に設定した `MASTRA_JWT_SECRET` の値

3. **JWTトークン**: JWT Secretから生成したトークン（後述）

## JWTトークンの生成

MCPサーバーはJWT認証で保護されているため、アクセスにはJWTトークンが必要です。

### Node.jsでの生成例

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

const secret = 'your-jwt-secret'; // MASTRA_JWT_SECRET と同じ値
const token = jwt.sign(
  {
    sub: 'user-id',
    name: 'User Name',
  },
  secret,
  {
    expiresIn: '30d', // 有効期限
  }
);

console.log(token);
```

### Pythonでの生成例

```bash
pip install pyjwt
```

```python
import jwt
from datetime import datetime, timedelta

secret = 'your-jwt-secret'  # MASTRA_JWT_SECRET と同じ値
payload = {
    'sub': 'user-id',
    'name': 'User Name',
    'exp': datetime.utcnow() + timedelta(days=30)  # 有効期限
}

token = jwt.encode(payload, secret, algorithm='HS256')
print(token)
```

### オンラインツールでの生成

[jwt.io](https://jwt.io/)などのオンラインツールでも生成できます：

1. Algorithmを `HS256` に設定
2. Payloadに以下を設定:
   ```json
   {
     "sub": "user-id",
     "name": "User Name",
     "exp": 1735689600
   }
   ```
3. Verify Signatureに `MASTRA_JWT_SECRET` を入力
4. 生成されたトークンをコピー

!!! warning "セキュリティ"
    本番環境では、JWTトークンを安全に管理してください。トークンが漏洩すると、第三者がMCPサーバーにアクセスできてしまいます。

## Cursorでの設定

### 設定ファイルの場所

プロジェクトルートに `.cursor/mcp.json` を作成します。

```bash
mkdir -p .cursor
```

### 設定例

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mastra-knowledge": {
      "transport": {
        "type": "http",
        "url": "https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/mcp/v1/knowledge",
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    }
  }
}
```

!!! note "URL構造"
    - ベースURL: `{Function URL}`（最後のスラッシュなし）
    - MCPエンドポイント: `/mcp/v1/{mcpServerName}`
    - この例: `/mcp/v1/knowledge`

### 設定の確認

1. Cursorを再起動
2. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）を開く
3. "MCP: Show Connected Servers" を検索
4. `mastra-knowledge` が表示されることを確認

### ツールの使用

チャットで以下のように指示できます：

```
knowledge_search を使って「AWS S3」に関する情報を検索して
```

```
knowledge_add を使って新しい情報を追加して：
タイトル: AWS Lambda
内容: AWS Lambdaはサーバーレスコンピューティングサービスです...
```

## Claude Desktop（Claude Code）での設定

### 設定ファイルの場所

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux**:
```
~/.config/Claude/claude_desktop_config.json
```

### 設定例

```json
{
  "mcpServers": {
    "mastra-knowledge": {
      "transport": {
        "type": "http",
        "url": "https://xxxxxxxxxx.lambda-url.ap-southeast-2.on.aws/mcp/v1/knowledge",
        "headers": {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    }
  }
}
```

### 設定の確認

1. Claude Desktopを再起動
2. チャット画面で🔌アイコンをクリック
3. `mastra-knowledge` が接続されていることを確認
4. 利用可能なツール（`knowledge_add`, `knowledge_search`など）が表示されることを確認

## トラブルシューティング

### 接続エラー

**症状**: "Failed to connect to MCP server"

**原因と対処**:

- Function URLが正しいか確認
- URLの最後にスラッシュが付いていないか確認（`/` は不要）
- MCPエンドポイントパス `/mcp/v1/knowledge` が正しいか確認

### 認証エラー

**症状**: "401 Unauthorized" または "403 Forbidden"

**原因と対処**:

- JWTトークンが正しいか確認
- JWTトークンの有効期限が切れていないか確認
- `Authorization: Bearer {token}` の形式が正しいか確認（`Bearer ` の後にスペースが必要）
- JWT Secretが正しいか確認（デプロイ時の `MASTRA_JWT_SECRET` と一致）

### タイムアウトエラー

**症状**: "Request timeout"

**原因と対処**:

- Lambdaのコールドスタート時は初回リクエストが遅くなる可能性があります
- 大量のデータを追加/検索する場合は時間がかかることがあります
- Lambda関数のタイムアウト設定（デフォルト900秒）を確認

### ツールが表示されない

**症状**: MCPサーバーは接続されているが、ツールが使えない

**原因と対処**:

- クライアントを再起動
- 設定ファイルのJSONフォーマットが正しいか確認
- Function URLが `/mcp/v1/knowledge` で終わっているか確認

## 次のステップ

- [ローカル開発](../development/local.md): ローカルでMCPサーバーをテスト
- [デプロイ](../deployment/cdk.md): CDKでのデプロイ方法
- [MCP Server](../development/mcp-server.md): MCPサーバーの詳細

