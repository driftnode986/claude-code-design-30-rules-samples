---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# テスト規約

> `paths` 付き rule。テストファイルを開いた時だけ読まれる。

## カバレッジ目標

- 単体テスト: 80% 以上
- 統合テスト: 全エンドポイント網羅
- E2E: クリティカルパス 100%

## モック方針

- 外部 API: MSW
- DB: 本物の PostgreSQL を Testcontainers で起動
- 時刻: `vi.useFakeTimers()`
- ランダム: `seedrandom` で seed 固定

## 命名

- describe: 対象の関数名・クラス名・エンドポイント名
- it: `should <expected> when <condition>`

## 禁則

- `console.log` をコミットしない (CI で fail)
- `it.only` / `describe.only` 禁止
- 本物の外部 API を叩かない
- `sleep` 禁止 (`waitFor` を使う)
