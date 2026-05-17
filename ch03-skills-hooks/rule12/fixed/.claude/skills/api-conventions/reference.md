# tRPC API Conventions: 詳細リファレンス

SKILL.md から参照される詳細ドキュメント。Claude は SKILL.md の指示に従い、必要なときだけ Read する。SKILL.md 本体には載せない (進化的開示原則)。

## 命名規則 (詳細)

### Query (read)

- `[resource].list`: 一覧取得。ページネーション必須 (`cursor` + `limit`)
- `[resource].get`: 単一取得。`id: z.string().uuid()` のみを引数に取る

### Mutation (write)

- `[resource].create`: 新規作成。返り値は作成済みリソース全体
- `[resource].update`: 部分更新 (PATCH 相当)。`id` + `patch: Partial<Resource>` を引数に取る
- `[resource].delete`: 論理削除 (`deleted_at` をセット)。物理削除は別エンドポイント `[resource].purge` で管理者のみ

### Action (副作用)

- `[resource].[verb]` 形式
- 例: `order.refund`, `user.invite`, `subscription.cancel`, `payment.capture`

## 入力バリデーション (詳細)

### Zod スキーマの配置

- スキーマは `src/server/schemas/[resource].ts` に集約
- router 定義 (`src/server/routers/[resource].ts`) からは import で参照
- フロントエンド (`src/lib/schemas`) と同じスキーマを共有 (DRY)

### よく使うバリデーション

- email: `z.string().email().toLowerCase()`
- 金額 (decimal): `z.number().multipleOf(0.01).positive().max(99999999.99)`
- UUID v7: `z.string().uuid()`
- 日付: `z.coerce.date()` または `z.string().datetime({ offset: true })`
- 電話番号: `z.string().regex(/^\+\d{10,15}$/)` (E.164 形式)
- パスワード: `z.string().min(12).max(128)` (BCrypt 上限 72 バイト考慮)

## エラーハンドリング (詳細)

### ビジネスエラー

```typescript
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Order is already refunded",
  cause: { orderId, attemptedAt: new Date() },
});
```

### 認可エラー

```typescript
throw new TRPCError({
  code: "FORBIDDEN",
  message: "User does not have permission to refund this order",
});
```

### Result 型 (予期せぬエラー)

```typescript
import { Result, ok, err } from "@/lib/result";

export const handler = async (input): Promise<Result<Output, AppError>> => {
  try {
    const result = await db.query(...);
    return ok(result);
  } catch (e) {
    if (e instanceof DBConnectionError) {
      return err({ type: "infra", retryable: true });
    }
    return err({ type: "unknown", cause: e });
  }
};
```

## レート制限 (詳細)

すべての mutation に `rateLimit` ミドルウェアを適用する。

- 通常 mutation: `{ window: "1m", max: 60 }`
- 認証系 (`auth.login`, `auth.signup`, `auth.password.reset`): `{ window: "1m", max: 5 }`
- 金銭系 (`payment.*`, `order.refund`): `{ window: "1m", max: 10 }`
- アカウントごとに分離 (`key: ctx.session.userId`)

レート制限の実装は `@/server/middleware/rateLimit.ts` 参照。Redis (ioredis) でカウンタを保持。

## 監査ログ (詳細)

監査ログが必要なミューテーションは `audit.log()` を必ず呼ぶ。

- 必須: 認証系 (`auth.login`, `auth.signup`)、金銭系 (`payment.*`, `order.refund`)、権限変更 (`user.role.update`)、削除系 (`*.delete`)
- 不要: 自分の通常操作 (`order.list`, `profile.update`)、システムが自動発火するもの (cron, webhook 受信)

実装:

```typescript
import { audit } from "@/lib/audit";

await audit.log({
  actor: ctx.session.userId,
  action: "order.refund",
  resource: { type: "order", id: input.orderId },
  metadata: { amount: input.amount, reason: input.reason },
});
```

## エラーコード一覧

| code | 意味 | 例 |
|------|------|-----|
| `BAD_REQUEST` | 入力エラー (Zod でキャッチできなかったビジネスルール違反) | 在庫不足、重複申請、上限超過 |
| `UNAUTHORIZED` | 未認証 | セッション切れ、トークン無効 |
| `FORBIDDEN` | 認証済みだが認可エラー | 他人の order を見ようとした |
| `NOT_FOUND` | リソースなし | 削除済み、存在しない ID |
| `CONFLICT` | 競合 | 同時編集、外部状態と矛盾 |
| `TOO_MANY_REQUESTS` | レート制限 | rateLimit ミドルウェアから発火 |
| `INTERNAL_SERVER_ERROR` | サーバー側エラー (Result 型で扱うべきもの) | DB 接続失敗、外部 API タイムアウト |
