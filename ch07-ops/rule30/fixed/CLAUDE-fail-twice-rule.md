# CLAUDE.md

## プロジェクト概要

Vue 3 + TypeScript の SPA。商品検索とカート機能を持つ EC サイト。

## 技術スタック

- Vue 3 (Composition API)
- TypeScript 5.5
- Vite
- Pinia (状態管理)
- Vitest (テスト)

## ディレクトリ構成

- `src/components/` — 単機能コンポーネント
- `src/views/` — ページ単位の View
- `src/stores/` — Pinia store
- `src/api/` — API クライアント

## コーディングルール

- props は必ず TypeScript で型定義
- ref / reactive はファイル内で 5 つまで
- API 呼び出しは `src/api/` 配下にのみ書く
- テストは Vitest で書く

## セッション運用ルール (Fail twice rule)

Anthropic 公式 `Best practices for Claude Code` が定める閾値ルール:

- **2 回連続で同じ問題の修正を依頼しても解決しない場合、`/clear` を実行
  してセッションをリセットする**
- リセット後は、学んだことを組み込んだより具体的な初期プロンプトで再起動
  する (元のプロンプトを再投入しない)
- 軽量な軌道修正には `/rewind` (チェックポイント巻き戻し) を使う
- 関連のないタスク間で `/clear` を実行する

出典: https://www.anthropic.com/engineering/claude-code-best-practices

## レビュー観点

- 型がついているか
- 副作用がコンポーネント内で発生していないか
- ストアと API の責務が混ざっていないか

## 注意点

- `vue-router` の `useRoute()` は `setup` 直下でのみ呼ぶ
- `<script setup>` の `defineProps` の型は inline で書く

<!--
この CLAUDE.md は Anthropic 公式が定める Fail twice rule を「セッション
運用ルール」セクションに明示している。

これにより:
- 2 回目の失敗時点で Claude 自身が「2 回連続失敗です。Anthropic 公式の
  Fail twice rule に従って /clear を推奨します」と提案する
- ユーザーは閾値ルールを暗黙知ではなく明示的な意思決定の対象として扱える
- context rot による解像度低下を意識的に防げる

出典: claude-code-best-practices.md L181 "A clean session with a better
prompt almost always outperforms a long session with accumulated corrections."
-->
