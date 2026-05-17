# Multi-agent 適用判断: 15× コストを払うかの 5 質問チェックリスト

> Anthropic Engineering Blog "How we built our multi-agent research system"
> (2025-06-13) L27 の適性条件 (向く 3 + 向かない 3) を実務用の 5 質問に再構成。

## 使い方

タスク開始前に 5 質問に回答する。**Q1-Q3 が全て YES** かつ **Q4-Q5 が両方 NO**
のときのみ Multi-agent を選択する。1 つでも条件を欠いたら Single agent +
filesystem (Rule 24) または Skill (Rule 13) を選ぶ。

## Q1: 真に並列化可能なサブタスクが 3+ ありますか?

- ✅ YES: サブタスク間に依存がなく、並列実行しても結果が変わらない
- ❌ NO: サブタスク同士の中間結果を参照する必要がある

NO なら Multi-agent は調整コストで赤字。

## Q2: 単一 context window に収まらない情報量ですか?

- ✅ YES: 1 セッションで持ち切れない (例: 100+ ファイル / 数十万トークンの一次資料)
- ❌ NO: 1 セッションの context に収まる

NO なら Single agent + filesystem (Rule 20 + Rule 24) で十分。

## Q3: 各 subagent が異なるツールセットを担当しますか?

- ✅ YES: 例えば「subagent-A は Amazon API、subagent-B は GitHub API、subagent-C は
  社内 Slack」のように分担できる
- ❌ NO: 全 subagent が同じ tool 群を使う

NO なら Multi-agent の利点 (ツール分散) を活かせない。

## Q4: 全エージェントが同じ context を共有する必要がありますか?

- ❌ YES: 共有が必要 — Multi-agent NG (L27 の不適合条件 1)
- ✅ NO: 各 subagent が独立 context で動ける

例: 「Order entity のスキーマを全 subagent が共有」は YES → Multi-agent NG。

## Q5: エージェント間に多くの依存がありますか?

- ❌ YES: subagent-A の結果に subagent-B が依存する設計
- ✅ NO: 各 subagent が完全独立

例: 「subagent-payment の API 設計が決まらないと subagent-cart が動けない」は
YES → Multi-agent NG。

## 判定マトリクス

| Q1 | Q2 | Q3 | Q4 | Q5 | 推奨 |
|----|----|----|----|----|------|
| YES | YES | YES | NO | NO | **Multi-agent OK** (15× を払う価値あり) |
| YES | YES | YES | YES | * | Single agent + 設計フェーズ分離 |
| YES | YES | YES | * | YES | Single agent + ADR |
| いずれか NO | * | * | * | * | Single agent + filesystem (Rule 24) |

`*` はワイルドカード。

## タスク価値の追加判定

Anthropic L27: "tasks where the value of the task is high enough to pay for the
increased performance"

5 質問が全て通過しても、**タスクの価値が 15× コストを正当化するか** を考える:

- ✅ 高価値: 経営判断・市場参入判断・大規模 refactor の事前調査
- ❌ 低価値: 日常のコーディング・1 行修正・ログ確認

低価値タスクに Multi-agent を立てるのは、Cessna 操縦に 747 を持ってくるようなもの。

## 関連 Rule

- Rule 13: Subagent vs Skill (コンテキスト分離が目的なら Subagent、知識注入なら Skill)
- Rule 16: Subagent は他の Subagent を生成できない (15× を 100× に膨らませない)
- Rule 20: MCP は code で呼べ (大量出力なら code execution が代替)
- Rule 24: Single agent + filesystem handoff (Multi-agent 不採用時の代替)
- Rule 26: 3-5 subagent が並列起動の上限 (15× が更に膨らむのを防ぐ実務上限)
