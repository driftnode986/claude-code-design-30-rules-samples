# アンチパターン: 進捗を CLAUDE.md にしか書かない

## CLAUDE.md (悪い例、800 行超え)

```markdown
# プロジェクト: claude.ai clone

## プロジェクト方針

(中略 500 行)

## 進捗ログ (毎セッション追記)

### 2026-04-10 セッション 1
- npm init + Next.js setup 完了
- src/app/page.tsx に初期 UI を実装
- ToDo: sidebar の実装

### 2026-04-12 セッション 2
- sidebar/Sidebar.tsx を新規作成
- conversation list の hardcode 版を実装
- ToDo: conversation 切り替えロジック

### 2026-04-15 セッション 3
- ConversationContext を実装
- conversation 切り替えで messages が更新されるように修正
- ToDo: メッセージ送信 form

(中略、20 セッション分)

### 2026-05-17 セッション 22
- theme switch を実装中
- localStorage への永続化はまだ未実装
- ToDo: localStorage 永続化 + ssr 対応

## コーディング規約

(中略 200 行)
```

## 何が起こるか

1. **CLAUDE.md が肥大化**: 1,500 行を超え、毎セッション読み込まれる context が
   膨張する (Rule 06 「CLAUDE.md は 200 行以内」違反)
2. **不要情報の attention budget 浪費**: 過去 21 セッション分の進捗ログが毎回
   コンテキストに乗る。「セッション 5 で何をやったか」は新しい coding agent には
   不要 (Rule 01 「コンテキストを有限の予算として扱う」違反)
3. **削除自問テスト不可**: CLAUDE.md は **永続的な方針** を書く場所であり、
   時系列の作業ログを書く場所ではない (Rule 07 違反)。進捗ログ部分を削っても
   プロジェクト方針は壊れないため、本来 CLAUDE.md に居るべきではない

## なぜ失敗するのか

- **永続化レイヤの混同**: 「永続的な方針」と「時系列の作業ログ」は別のファイルに
  分離するべき
- **検索性の悪化**: `claude-progress.txt` なら直近 N セッション分だけ tail する
  ことで agent が必要な情報だけを取れる。CLAUDE.md 内に埋め込むと毎回全文が
  context に乗る
- **git との二重管理**: コードの差分は `git log` に既にある。CLAUDE.md に
  「session 5 でこのファイルを作った」と書くのは情報の冗長性 (DRY 違反)

## 修正方針

進捗ログを **`claude-progress.txt` (プロジェクトルート直下)** に切り出し、
CLAUDE.md からは進捗ログを完全削除する。

`fixed/claude-progress.txt.example` のスキーマに従い、
**直近 3-5 セッション分のみ** を残し、それ以前は git history に任せる。
