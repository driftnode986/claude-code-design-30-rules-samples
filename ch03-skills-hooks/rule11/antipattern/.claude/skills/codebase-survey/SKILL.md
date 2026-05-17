---
name: codebase-survey
description: Survey the entire codebase to find all usages of a function or pattern. Use for large refactoring tasks.
---

# Codebase Survey (anti-pattern: コンテキスト分離なのに Skill 化)

> 大規模コードベースを総当たり調査するタスクを Skill にしている。
> Skill は **親ウィンドウに展開される** ため、調査で読んだ何十ファイル分のトークンがメインの会話に流れ込み、コンテキストロットを誘発する。
> **正解は: Subagent (Explore など) に委譲して、要約 1,000-2,000 トークンだけ返してもらう**。

## 手順

1. `Glob` で対象ファイルを列挙
2. `Grep` でパターン検索
3. 該当箇所をすべて `Read` で開いて読む (← ここで数万トークン消費)
4. ユーザーに使用箇所一覧を報告

(3 で親ウィンドウが汚染される。Subagent なら別ウィンドウで読んで要約だけ戻す)
