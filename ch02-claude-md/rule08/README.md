# Rule 08: プロジェクト固有の罠を書け

書籍『Claude Code 設計の30の鉄則』 Rule 08 のサンプルです。

## ファイル

- `antipattern/CLAUDE.md`: 一般論しか書かれていない CLAUDE.md。
  「pnpm を使う」「TypeScript strict」のような Claude が推測可能な
  情報だけが並び、プロジェクト固有の罠は一切書かれていない
- `fixed/CLAUDE.md`: 罠を 5 件、症状 → 原因 → 回避策の 3 点セットで
  書いた CLAUDE.md

## 罠の典型 5 カテゴリ

1. **データ整合性の罠** (event_log の TRUNCATE 禁止)
2. **ラッパ強制の罠** (lib/clock.ts の now() 経由)
3. **環境依存の罠** (preview 環境はリードオンリー)
4. **API/SDK の非自明な仕様** (Stripe event.id 不変ではない)
5. **CI とローカルの差** (lockfile の扱い)

## 書き方の原則

- 症状 → 原因 → 回避策の 3 点セット
- 抽象スローガン ("セキュリティに気をつける") は罠ではない
- Claude が読めば気づくものも罠ではない
- 罠の数は 5-10 件に絞る (Rule 06「200 行以内」遵守)

## 検証バージョン

Claude Code CLI v2.x

## 関連

- Rule 06: CLAUDE.md は 200 行以内に保て
- Rule 07: 削除自問テストでプルーニングする (残すべきカテゴリ F の典型)
- Rule 14: Hook で絶対実行を書け (「絶対に〇〇するな」型の罠の昇格先)
