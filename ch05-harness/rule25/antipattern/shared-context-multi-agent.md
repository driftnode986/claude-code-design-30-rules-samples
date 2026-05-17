# アンチパターン: 共有 context が必要な作業に Multi-agent

## 状況

「ECサイトの注文フローを改修したい」という要件で、`order/`, `cart/`, `payment/`,
`shipping/` の 4 モジュールを 4 subagent に並列で割り当てた例。

## 失敗した orchestrator-prompt.md

```markdown
You are a lead orchestrator. The user wants to add a new "split payment" feature
where customers can pay part with credit card and part with store credit.

Spawn 4 subagents in parallel:

1. **subagent-order**: `order/` の Order entity に split_payment フィールドを追加
2. **subagent-cart**: `cart/` の Cart に split_payment を反映
3. **subagent-payment**: `payment/` の処理ロジックを 2 段階決済に変更
4. **subagent-shipping**: `shipping/` の配送条件を更新

各 subagent は自分のモジュール内の変更を完成させて報告すること。
```

## 何が起こるか

1. **データモデルの不整合** — `subagent-order` は `split_payment: { card: 50, credit: 30 }` の
   ネスト構造を選択。`subagent-cart` は `payment_method: ['card', 'credit']` の配列
   構造を選択。**統合段階で型が一致しない**
2. **API contract の二重定義** — `subagent-payment` が `/payments/split` エンドポイントを
   新設するが、`subagent-cart` は `/cart/checkout` に `split_payment_amount` を直接
   渡そうとする。**4 エージェントの API 設計が衝突**
3. **テストの並行修正が破綻** — `payment/tests/` と `order/tests/` がそれぞれ別の
   fixture (`testOrder.json`) を更新し、`subagent-shipping` のテストが古い fixture を
   読み続けて落ちる
4. **15× トークン消費** + **統合工数** = **chat 1 回の 25 倍以上**

## なぜ失敗するのか

「split payment」は **設計判断が事前に揃っていない** 機能です。データ構造・API
contract・テスト fixture を **どの subagent も独立して決められない**。

Anthropic Engineering Blog L27 が明示する向かない条件:

- ✅ "domains that require all agents to share the same context" — Order entity の
  shape を 4 agent 全員が共有する必要がある
- ✅ "many dependencies between agents" — `subagent-payment` の決定が
  `subagent-order` `subagent-cart` `subagent-shipping` の全てに影響
- ✅ "LLM agents are not yet great at coordinating and delegating to other agents in
  real time" — 4 agent が「split_payment のスキーマをどうするか」を会議できない

## 修正方針

設計フェーズと実装フェーズを分離する。

1. **設計フェーズ (single agent)**: Order entity のスキーマ・API contract・
   テスト fixture を 1 agent が決定し、`claude-progress.txt` (Rule 24) と
   ADR (Architecture Decision Record) に記録
2. **実装フェーズ (single agent または、設計が完全に固まった後の multi-agent)**:
   ADR を読んで各モジュールを順次実装。**並列化するなら設計確定後**

Rule 23 の「initializer + coding 二段ハーネス」と同型で、設計を initializer、
実装を coding に分けるパターン。Multi-agent はそもそも実装段階でも不要なケースが多い。
