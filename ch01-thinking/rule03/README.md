# Rule 03: Workflow か Agent か — 二項対立で考える

## このサンプルで何を見せるか

Anthropic Engineering Blog "Building effective agents" (2024-12-19) は、すべての agentic system を 2 つのアーキテクチャに分けて論じている:

> - **Workflows** are systems where LLMs and tools are orchestrated through predefined code paths.
> - **Agents**, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks.

Workflow は「定義済みコードパスで LLM とツールを orchestrate するシステム」、Agent は「LLM が自分のプロセスとツール使用を動的に方向付けるシステム」。本書 Rule 03 は、この二項対立を Claude Code に持ち込む。「Subagent を便利な関数として呼ぶ」アンチパターンを取り除き、立ち位置を決めてから設計する習慣を作る。

このディレクトリには次の 3 ファイルを置く:

- `bad/decision-flow.md` — 立ち位置を決めずに Subagent を「便利な関数」として呼ぶエージェント定義 (Workflow としても Agent としても中途半端)
- `good/workflow-example.md` — Workflow として設計された「リリースノート生成」タスクの pseudocode (Anthropic Workflow パターンの Prompt chaining + Evaluator-optimizer)
- `good/agent-example.md` — Agent として設計された「バグ調査・修正」タスクの定義 (Claude Code 自身に方向付けを委ねる、ステップ数不定の例)

## Claude Code 機能と Workflow/Agent の対応マップ

本書の文脈で Claude Code の主要機能を Workflow / Agent 軸で並べると:

- **Hooks** → Workflow 寄り (定義済みイベントで実行される確定的処理。`PreToolUse` `PostToolUse` `SessionStart` などで「ここでは必ずこれをやる」を書く)
- **Skills** → 中間 (Claude が条件を満たしたときに自律的にロードする = Agent 的な選択 + Skill 内部は手順書 = Workflow 的)
- **Subagents** → Agent 寄り (動的にタスクを委任し、サブエージェント側が方向付けを担う)
- **MCP** → 両方の素材 (Tool 群として Workflow にも Agent にも使われる)

詳細は本書 Part 3 (Rule 11-16) で展開する。

## なぜこの比較サンプルは pseudocode 中心か

本書 Rule 03 は思想編 (Part 1) に位置し、Claude Code の具体機能を選ぶ段階ではない。実装の細部に入ると Rule 11 以降の領域に踏み込んでしまうため、Rule 03 では「立ち位置を決める」という意思決定そのものを示すことに集中する。実装サンプルは Rule 11 以降の companion repo ディレクトリで扱う。

## 検証バージョン

- Claude Code CLI: v2.x
- 確認日: 2026-05-17
