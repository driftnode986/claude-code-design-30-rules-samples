# API 規約

> このファイルは CLAUDE.md から @docs/api-conventions.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される (公式 docs memory.md の Size セクション)。**

## RESTful 命名規則

- リソースは複数形 (`/users`, `/posts`, `/comments`)
- ネストは 2 階層まで (`/users/:id/posts` OK、`/users/:id/posts/:postId/comments` NG)
- アクション URL は禁止 (`/users/:id/activate` ではなく `PATCH /users/:id` で `status: "active"` を送る)
- バージョニングはパス先頭 (`/v1/users`)

## レスポンス形式

成功時:

```json
{
  "data": { ... },
  "meta": { "pagination": { "page": 1, "total": 100 } }
}
```

エラー時:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Email is required",
    "fields": [{ "field": "email", "issue": "missing" }]
  }
}
```

## HTTP ステータスコード

- 200 OK: 取得成功・更新成功
- 201 Created: リソース作成成功
- 204 No Content: 削除成功
- 400 Bad Request: バリデーションエラー
- 401 Unauthorized: 認証エラー (トークン不正/不在)
- 403 Forbidden: 認可エラー (権限不足)
- 404 Not Found: リソース不在
- 409 Conflict: 一意制約違反など
- 422 Unprocessable Entity: バリデーション通過後のビジネスロジックエラー
- 429 Too Many Requests: レート制限
- 500 Internal Server Error: サーバー側の予期せぬエラー

## 入力検証

- 全エンドポイントで Zod スキーマ必須
- リクエスト body / query / params すべて検証
- 検証失敗時は 400 + 上記エラー形式
- スキーマは `src/api/schemas/<resource>.ts` に集約

## 認証

- JWT (RS256) を `Authorization: Bearer <token>` で送る
- アクセストークン有効期限: 15 分
- リフレッシュトークン有効期限: 30 日
- リフレッシュトークンは HttpOnly Cookie で配信、JS から読めないようにする
- ログアウト時はリフレッシュトークンを Redis のブラックリストに追加

## 認可

- ロール: `admin` / `member` / `viewer`
- リソースレベルの権限は CASL を使用 (`@casl/ability`)
- 各エンドポイントで `req.ability.can('read', 'Post')` の形でチェック
- 認可失敗時は 403 + `{ error: { code: 'FORBIDDEN', resource: 'Post', action: 'read' } }`

## レート制限

- 認証なし: 30 req/min/IP
- 認証あり: 300 req/min/user
- 制限超過時は 429 + `Retry-After` ヘッダー
- Redis ベースの sliding window で実装

## ページネーション

- offset/limit ではなく cursor-based を採用
- レスポンスに `meta.pagination.next_cursor` を含める
- クライアントは次ページ取得時に `?cursor=<next_cursor>` を付与
- 1 ページ最大 100 件、デフォルト 20 件

## API ドキュメント

- OpenAPI 3.1 で記述
- `src/api/openapi.yaml` を source of truth とする
- Swagger UI を `/docs` で公開 (本番では認証必須)
- 全エンドポイントに `summary` `description` `requestBody` `responses` 必須

## エラーログ

- 5xx エラーは Sentry に送信 (リクエスト ID 付き)
- 4xx エラーは構造化ログに記録 (ユーザー ID + リクエスト ID + エラーコード)
- 個人情報 (メール・パスワード) はログに含めない

## CORS

- 許可オリジン: 環境変数 `ALLOWED_ORIGINS` で制御
- `credentials: true` で Cookie 送信を許可
- preflight キャッシュ: 1 時間 (`Access-Control-Max-Age: 3600`)

## ヘルスチェック

- `/health` (認証不要): 自身の生死のみ
- `/health/deep` (認証不要、内部 IP のみ): DB/Redis/外部 API の疎通確認
- 両方とも JSON で `{ status: "ok" | "degraded" | "down", checks: { ... } }`
