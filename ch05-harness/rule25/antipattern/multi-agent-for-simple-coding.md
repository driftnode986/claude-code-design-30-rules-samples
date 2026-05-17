# アンチパターン: 簡単なリファクタリングに Multi-agent を立てる

## 状況

「`src/` 配下の `console.log` を `logger.info` に置換したい」というよくある
リファクタリング要件で、Multi-agent を構成してしまった例。

## 失敗した orchestrator-prompt.md

```markdown
You are a lead orchestrator. Spawn 5 subagents in parallel to refactor `console.log`
to `logger.info` across the codebase:

1. **subagent-frontend**: `src/components/` 配下を担当
2. **subagent-backend**: `src/api/` 配下を担当
3. **subagent-utils**: `src/utils/` 配下を担当
4. **subagent-tests**: `tests/` 配下を担当
5. **subagent-scripts**: `scripts/` 配下を担当

各 subagent は担当ディレクトリの `console.log` を `logger.info` に置換し、
変更したファイル一覧を報告すること。
```

## 何が起こるか

1. **5 subagent 並列起動** — 各 subagent は context window をフルに割り当てられる
2. **重複 import 競合** — `subagent-utils` が `import { logger } from '@/lib/logger'` を
   追加するが、`subagent-frontend` も同じファイル (`src/utils/helpers.ts`) を編集して
   別の logger import パスを使う
3. **テストとソースの整合性破綻** — `subagent-tests` が `console.log` を `logger.info`
   に置換するが、テストの mock 設定 (`jest.spyOn(console, 'log')`) を考慮しない
4. **lead agent のマージ作業が膨大** — 5 subagent の戻り値を再統合するために、
   さらに別の context window を消費する
5. **コスト**: 15× トークン消費 + 重複作業 + 修正ループ = **chat 1 回の 20-30 倍**

## なぜ失敗するのか

Anthropic Engineering Blog "How we built our multi-agent research system"
(2025-06-13) L27 の指摘そのもの:

> some domains that require all agents to share the same context or involve
> many dependencies between agents are not a good fit for multi-agent systems
> today. For instance, **most coding tasks involve fewer truly parallelizable
> tasks than research**, and LLM agents are not yet great at coordinating and
> delegating to other agents in real time.

(著者訳) 一部のドメイン、すなわち全エージェントが同じコンテキストを共有する必要が
あるものや、エージェント間の依存が多いものは、現時点では multi-agent システムに
向きません。たとえば、ほとんどのコーディングタスクはリサーチほど真に並列化可能な
タスクが少なく、LLM エージェントはまだリアルタイムで他のエージェントと協調・
委譲することに長けていません。

このリファクタリングは「共有 context」(import 文の依存) + 「dependencies between agents」
(同じプロジェクト規約) の両方に該当する典型的な coding task で、Multi-agent には
最も向かない部類です。

## 修正方針

`fixed/single-agent-with-filesystem.md` の Single agent + glob + sed パターンに
置き換える。1 agent が `Glob "src/**/*.ts"` で対象ファイルを列挙し、
`MultiEdit` で一括置換、テスト mock 設定の更新を 1 行ずつ確認する。
コストは Multi-agent の約 4 分の 1。
