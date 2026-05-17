---
name: api-conventions
description: tRPC API conventions for acme-app. Use when implementing or reviewing tRPC routers, mutations, or queries.
paths:
  - "src/server/**"
  - "src/trpc/**"
---

# API 規約 (acme-app)

すべての API エンドポイントは tRPC で実装する。本ファイルは概要のみ。詳細な命名規則・バリデーション・エラーハンドリングは [reference.md](reference.md) を必要に応じて参照する。

## 命名規則 (要約)

- Query (read): `[resource].list`, `[resource].get`
- Mutation (write): `[resource].create`, `[resource].update`, `[resource].delete`
- Action (副作用): `[resource].[verb]` (例: `order.refund`)

## 入力バリデーション (要約)

- Zod スキーマで必ず入力をバリデート
- email は `z.string().email()`、金額は `z.number().multipleOf(0.01).positive()`、UUID は `z.string().uuid()`

## エラーハンドリング (要約)

- ビジネスエラー: `TRPCError({ code: "BAD_REQUEST", message: "..." })`
- 認可エラー: `TRPCError({ code: "FORBIDDEN" })`
- 予期せぬエラーは `Result<T, E>` で返す (`@/lib/result` 参照)

## 詳細

レート制限、監査ログ、特定エンドポイントの命名例、すべてのエラーコードは [reference.md](reference.md) を Read で参照する。SKILL.md には載せない (description + when_to_use の 1,536 文字予算と SKILL.md の 500 行推奨上限を守るため)。
