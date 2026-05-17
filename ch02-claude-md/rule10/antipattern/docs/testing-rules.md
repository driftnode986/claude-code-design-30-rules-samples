# テスト規約

> このファイルは CLAUDE.md から @docs/testing-rules.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される。**

## テストの層

- **単体テスト** (Jest): 純粋関数・ビジネスロジック
- **統合テスト** (Vitest + Supertest): API エンドポイント単位
- **E2E テスト** (Playwright): ブラウザでユーザー操作を再現
- **契約テスト** (Pact): フロントエンド ↔ バックエンドの API 契約

## カバレッジ目標

- 単体テスト: 80% 以上 (statements / branches / functions / lines)
- 統合テスト: 全エンドポイント網羅
- E2E: クリティカルパス (ログイン / 決済 / データ作成) 100%

## ファイル配置

- 単体テスト: `src/<path>/<file>.test.ts` (同階層)
- 統合テスト: `tests/integration/<resource>.test.ts`
- E2E テスト: `tests/e2e/<flow>.spec.ts`

## モック方針

- 外部 API は MSW (Mock Service Worker) でモック
- DB は本物の PostgreSQL を Docker で起動 (Testcontainers)
- 時刻は `vi.useFakeTimers()` で固定
- ランダム値は `seedrandom` で seed 固定

## テストデータ

- Factory パターンを使用 (`src/test/factories/`)
- 各テストは独立してデータを作成 (テスト間でデータを共有しない)
- DB は各テストの前後でクリーンアップ (Truncate)

## アサーション

- `expect.toEqual()` ではなく `expect.toStrictEqual()` を使う
- 配列の順序が重要でない場合は `expect.toIncludeAllMembers()`
- エラーメッセージは英語で記述

## 命名

- describe: 対象の関数名・クラス名・エンドポイント名
- it / test: `should <expected behavior> when <condition>`
- 例: `describe('createUser', () => { it('should return 201 when valid email is provided', ...) })`

## CI 実行

- PR ごとに全テスト実行 (GitHub Actions)
- main マージ後にステージング環境で E2E 再実行
- 本番デプロイ前に Smoke テスト (5 分以内)

## 失敗時の対応

- フレイキーテストは即 issue 化 (ラベル: `flaky-test`)
- 3 回連続で失敗した場合、`describe.skip` で一時的に無効化 + 期限付き issue 化 (2 週間以内に修正)
- skip したテストは GitHub Actions の summary に警告として表示

## 性能テスト

- API のレスポンスタイム上限を assertion (`expect(duration).toBeLessThan(200)`)
- 大量データ処理は専用ベンチマーク (`tests/bench/`)
- k6 で負荷テスト (週次)

## 視覚回帰テスト

- Playwright の `expect(page).toHaveScreenshot()` を使用
- スクリーンショットは `tests/e2e/screenshots/` に保存
- 差分が出たら PR 内で確認 (Chromatic 連携)

## 禁則事項

- `console.log` をテストに残さない (CI で fail)
- `it.only` `describe.only` を commit しない (lint で禁止)
- 本物の外部 API を叩くテストは禁止 (CI 環境で発火しないように URL を `localhost` にする)
- `sleep` を使った待機は禁止 (`waitFor` を使う)

## レビュー観点

- テストが先か実装が先かを問わず、両方が PR に含まれていること
- アサーションが具体的か (`expect(result).toBeTruthy()` ではなく `expect(result.status).toBe('active')`)
- エッジケース (空配列・null・undefined・上限値・境界値) のカバー
- 失敗ケース (バリデーション失敗・権限不足・タイムアウト) のカバー
