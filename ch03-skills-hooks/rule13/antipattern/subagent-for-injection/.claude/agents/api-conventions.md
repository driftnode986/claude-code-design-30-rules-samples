---
name: api-conventions
description: Apply acme-app's tRPC API conventions. Invoke when implementing or reviewing any tRPC endpoint.
tools: Read, Grep, Glob, Edit, Write, Bash
model: inherit
---

# API Conventions Agent (anti-pattern: 知識注入を Subagent で実装)

> 本来 Skill (知識注入) であるべき API 規約を Subagent (コンテキスト分離) として実装している失敗例。
>
> **問題点 1**: Subagent は独立コンテキストウィンドウで動くため、メイン会話の前段の議論 (どの機能を作っているか、どんな設計判断をしたか) を引き継げない。`@api-conventions implement /users/list` と呼んでも、Subagent は「何の文脈で users.list を作るのか」を知らない状態で着手する。
>
> **問題点 2**: Subagent は終了時に要約 (1,000-2,000 トークン) だけ返してメイン会話を抜ける。メイン会話に戻った瞬間、API 規約の知識は消える。次のターンで別のエンドポイントを実装するときに、また `@api-conventions` を呼び直さないと適用されない。
>
> **問題点 3**: Subagent の起動コストはチャットの 15 倍トークン消費 (Anthropic Engineering Blog "Multi-agent research system" Jun 2025)。1 行のヘルパー関数を書くたびに Subagent を起動する設計は経済的に成り立たない。
>
> **正解**: API 規約は Skill (知識注入軸) として実装する。`fixed/.claude/skills/api-conventions/SKILL.md` 参照。

## あなたの役割

あなたは acme-app の tRPC API 規約の専門家です。次の規約に従って API を実装してください:

### 命名規則

- Query: `[resource].list`, `[resource].get`
- Mutation: `[resource].create`, `[resource].update`, `[resource].delete`

### バリデーション

- Zod スキーマで必ず入力をバリデート
- email: `z.string().email()`
- 金額: `z.number().multipleOf(0.01).positive()`

### エラーハンドリング

- ビジネスエラー: `TRPCError({ code: "BAD_REQUEST" })`
- 認可エラー: `TRPCError({ code: "FORBIDDEN" })`

(以降、規約の続き。これを Subagent として実装するとメイン会話から呼び直さないと適用されない)
