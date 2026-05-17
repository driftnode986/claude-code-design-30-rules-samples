---
name: test-runner
description: Run the full test suite and surface failing tests. Use when the user wants to check test status or fix failures.
allowed-tools: Bash(npm test), Bash(npm run test:*), Read, Grep
---

# Test Runner (anti-pattern: コンテキスト分離を Skill で実装)

> 本来 Subagent (コンテキスト分離) であるべきテスト実行を Skill (知識注入) として実装している失敗例。
>
> **問題点 1**: Skill はメイン会話と同一のコンテキストウィンドウで動く。`npm test` の出力 (失敗テスト 30 件 × stack trace 50 行 = 約 80,000 トークン) がそのままメインに流入する。
>
> **問題点 2**: Skill は呼び出された瞬間から終了まで、すべての出力がメインの会話履歴に残る。テストが flaky で 3 回実行すれば、3 回分の出力が累積する。20 万トークンのコンテキストウィンドウが数分で枯渇する。
>
> **問題点 3**: テスト結果を分析した後、別の作業 (バグ修正・リファクタリング) に戻ってもテストの大量出力がメインに残り続けるため、context rot (コンテキスト腐食) を誘発する。Rule 01 で扱った「アテンション予算」を自分で潰している状態。
>
> **正解**: テスト実行は Subagent (コンテキスト分離軸) として実装し、要約 1,000-2,000 トークンだけメインに返す。`fixed/.claude/agents/test-runner.md` 参照。

## 手順

1. `npm test` を実行
2. 失敗したテストファイル・テストケース・エラーメッセージをすべて報告
3. 各エラーについて、原因と修正案を提示

(これを Skill として実装すると、80,000 トークンのテスト出力が全部メインに流れ込んで、残りの会話のための予算が枯渇する)
