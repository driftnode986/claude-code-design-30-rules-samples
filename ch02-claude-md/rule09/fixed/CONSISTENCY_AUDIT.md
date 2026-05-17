# CONSISTENCY_AUDIT.md

ルート CLAUDE.md と各サービス CLAUDE.md の矛盾を定期監査する
ためのチェックリスト。

## 監査の動機

公式ドキュメント「メモリ」(`memory.md`) には次の一文がある:

> 一貫性: 2 つのルールが互いに矛盾している場合、Claude は 1 つを
> 任意に選択する可能性があります。

複数の CLAUDE.md ファイルは「上書き」ではなく「連結」される
(同ドキュメント、CLAUDE.md ファイルの読み込み方法)。
親と子で同じトピックを別方針で書くと、Claude はどちらかを任意に
選び、その結果が安定しない。

## 監査の頻度

- 月 1 回、CLAUDE.md レビュー会 (15 分) を開く
- 新規サービス追加時 (`packages/<new>/CLAUDE.md` が増えたとき)
- 「Claude が以前と違う挙動をする」と感じたとき

## 監査チェックリスト

### 1. ルート CLAUDE.md と各サービス CLAUDE.md で同じトピックを扱っていないか

例: パッケージマネージャ、テストランナ、import スタイル

- ルート側に書かれているなら、サービス側で再記述しない
  (再記述すると、片方を更新したときに矛盾が発生する)
- サービスごとに違ってよい事項は、ルートで「サービス側で決めてよい」
  と宣言する (本リポジトリの fixed/CLAUDE.md がその形)

### 2. paths スコープルール同士で矛盾していないか

例: `.claude/rules/typescript.md` と `.claude/rules/api.md` が
同じパスを対象に異なる規約を書いていないか

```bash
# paths frontmatter を持つルールファイルを列挙
grep -rl "^paths:" .claude/rules/
```

### 3. 個人用 CLAUDE.local.md と共有 CLAUDE.md で食い違っていないか

`.gitignore` 対象なので他メンバーには見えないが、本人のセッションでは
連結される。

### 4. 古い CLAUDE.md を消し忘れていないか

- `legacy-archive/` や `experiments/` 配下に旧 CLAUDE.md が
  残っていないか確認
- 残ってしまう場合は `.claude/settings.local.json` の
  `claudeMdExcludes` で除外する (本リポジトリの fixed/.claude/settings.json 参照)

### 5. `/memory` コマンドで現在ロード中のファイルを確認

セッション内で `/memory` を実行すると、現在 Claude が読み込んでいる
CLAUDE.md と rules ファイルが一覧表示される。想定外のファイルが
リストされていないか定期的に確認する。

## 監査結果の記録

矛盾を発見・解消したら、本ファイル末尾に追記する。

### 2026-05-17 監査

- 監査対象: ルート CLAUDE.md + packages/billing/CLAUDE.md
- 発見した矛盾:
  - パッケージマネージャ (ルート: pnpm / billing: npm) → ルートに
    「pnpm に統一、サービス側で npm/yarn 禁止」と明記、billing
    CLAUDE.md からマネージャ記述を削除
  - main 直接 push (ルート: 許可 / billing: 禁止) → ルートで「全サービス
    main 直接 push 禁止」に統一
  - レビュー要件 (ルート: 不要 / billing: 2 名必須) → ルートは
    「サービス側で決めてよい事項」と宣言、billing は固有要件として
    維持
- 解消後: 矛盾 0 件
