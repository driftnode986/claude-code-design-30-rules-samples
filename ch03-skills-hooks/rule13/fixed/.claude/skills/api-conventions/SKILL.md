---
name: api-conventions
description: tRPC API conventions for acme-app. Use when implementing or reviewing tRPC routers, mutations, or queries.
paths:
  - "src/server/**"
  - "src/trpc/**"
---

# API 規約 (acme-app) — Skill が正解 (知識注入軸)

これは「同じ規約を複数のタイミングで呼び出して、メイン会話の流れに統合したい」ケース。Skill が正解。

- メイン会話のコンテキストに inline 注入される。前段の議論 (どの機能を実装しているか、どんな設計判断をしたか) を引き継いで規約を適用できる
- `paths` で API 関連ファイル編集時に自動展開され、毎回 `@-mention` で呼び出す必要がない
- 知識を「メイン会話と一緒に動かす」設計

## 命名規則

- Query: `[resource].list`, `[resource].get`
- Mutation: `[resource].create`, `[resource].update`, `[resource].delete`
- Action: `[resource].[verb]`

## バリデーション

- Zod スキーマで必ず入力をバリデート
- email: `z.string().email().toLowerCase()`
- 金額: `z.number().multipleOf(0.01).positive().max(99999999.99)`
- UUID v7: `z.string().uuid()`

## エラーハンドリング

- ビジネスエラー: `TRPCError({ code: "BAD_REQUEST", message: "..." })`
- 認可エラー: `TRPCError({ code: "FORBIDDEN" })`
- 予期せぬエラーは `Result<T, E>` で返す

## レート制限

- 通常 mutation: `{ window: "1m", max: 60 }`
- 認証系: `{ window: "1m", max: 5 }`
- 金銭系: `{ window: "1m", max: 10 }`
