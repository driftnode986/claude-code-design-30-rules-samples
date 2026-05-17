---
paths:
  - "src/api/**/*.ts"
---

# API 規約

> `paths: src/api/**/*.ts` 付きの rule。**`src/api/` 配下のファイルを開いた時だけ** コンテキストに読み込まれる。
> 起動時には読まれない (公式 docs `memory.md` の path-specific rules)。

## RESTful 命名規則

- リソースは複数形 (`/users`, `/posts`)
- ネスト 2 階層まで
- アクション URL 禁止 → `PATCH` で状態変更

## レスポンス形式

成功: `{ data, meta: { pagination } }` / エラー: `{ error: { code, message, fields? } }`

## HTTP ステータス

- 200/201/204 = 成功 / 400/401/403/404/409/422/429 = クライアントエラー / 500 = サーバーエラー

## 入力検証

- 全エンドポイントで Zod スキーマ必須
- スキーマは `src/api/schemas/<resource>.ts` に集約

## 認証

- JWT (RS256) を `Authorization: Bearer <token>` で
- アクセス: 15 分、リフレッシュ: 30 日 (HttpOnly Cookie)

## 認可

- CASL で `req.ability.can('action', 'resource')` チェック
- 失敗時は 403 + `{ error: { code: 'FORBIDDEN' } }`

## レート制限

- 認証なし: 30 req/min/IP、認証あり: 300 req/min/user

## ページネーション

- cursor-based、レスポンスに `meta.pagination.next_cursor`
- 1 ページ最大 100 件、デフォルト 20 件
