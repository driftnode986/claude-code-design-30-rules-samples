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

## レビュー観点

- 型がついているか
- 副作用がコンポーネント内で発生していないか
- ストアと API の責務が混ざっていないか

## 注意点

- `vue-router` の `useRoute()` は `setup` 直下でのみ呼ぶ
- `<script setup>` の `defineProps` の型は inline で書く

<!--
このアンチパターン CLAUDE.md には Fail twice rule が書かれていない。

結果として、ユーザーが「テストが落ちる」「型エラーが出る」「import パスが
おかしい」を 1 セッション内で 6 回連続修正しても、Claude Code は「修正を
繰り返す」ハーネス挙動を続ける。3 回目以降の修正は context が
失敗アプローチで汚染されているため、新たな失敗を上塗りするだけになる。

CLAUDE.md には Anthropic 公式が定める Fail twice rule を明示し、
2 回目の失敗時点でユーザー自身が `/clear` への切り替えを意思決定できる
状態を作るべきである。
-->
