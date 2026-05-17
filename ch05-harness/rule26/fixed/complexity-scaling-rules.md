# Complexity Scaling Rules: タスク複雑度に応じた並列度設定

> Anthropic Engineering Blog "How we built our multi-agent research system"
> (2025-06-13) L49 の 3 段階スケーリングを実務用に再構成。

## 原理 (L49 直接引用)

> Agents struggle to judge appropriate effort for different tasks, so we
> embedded scaling rules in the prompts. **Simple fact-finding requires
> just 1 agent with 3-10 tool calls, direct comparisons might need 2-4
> subagents with 10-15 calls each, and complex research might use more than
> 10 subagents with clearly divided responsibilities.**

エージェントは「どれだけ努力すべきか」を自分で判断するのが苦手。
ルールを prompt に埋め込む必要がある。

## 3 段階スケーリング

### Tier 1: Simple Fact-Finding

- **並列度**: 1 agent (Multi-agent 不採用)
- **ツールコール**: 3-10 回
- **例**:
  - 「Claude Code の最新バージョンは?」
  - 「ファイル `package.json` を読んで dependencies を列挙して」
  - 「Anthropic の最新 blog post 1 件のタイトルを教えて」
- **判定基準**: 単一の事実取得、context window 内に収まる、並列化の利得なし

### Tier 2: Direct Comparisons

- **並列度**: 2-4 subagents (3-5 上限の範囲内)
- **ツールコール**: 各 subagent 10-15 回
- **例**:
  - 「3 つのフレームワーク (Next.js / Nuxt / SvelteKit) を比較」
  - 「2 社のプロダクト価格戦略を比較分析」
  - 「過去 3 年の Q4 売上を競合 4 社で対比」
- **判定基準**: 独立した複数対象の並列調査、戻り値を比較表に集約

### Tier 3: Complex Research

- **並列度**: 5+ subagents (本書推奨は **5 まで**、Anthropic は 10+ も認める)
- **ツールコール**: 各 subagent 15+ 回
- **例**:
  - 「日本の AI スタートアップ 100 社の最新ファンディング」 (5 subagent × 20 社)
  - 「S&P 500 の取締役全員の経歴」 (Anthropic 公式例、L23)
  - 「Claude Code 関連 OSS の活発度トップ 50 を多軸分析」
- **判定基準**: heavy parallelization + context window 超過 + 多数複雑ツール
- **注意**: Anthropic L49 は「clearly divided responsibilities」(明確な責務分担) を前提とする

## 本書独自の Tier 4 警告

Anthropic L43 が示した失敗パターン:

> Early agents made errors like spawning 50 subagents for simple queries

**6 subagent 以上**を起動する場合は以下を確認:

1. ✅ Rule 25 の 5 質問チェックリスト全通過
2. ✅ 各 subagent の責務が clearly divided (重複・空白がない)
3. ✅ 戻り値の合計が lead agent context window に収まる (各 1,000-2,000 トークン)
4. ✅ Synchronous bottleneck (L85) を許容できる (最遅 subagent が全体律速)

3 つ未満なら Tier 2 (2-4 subagents) に降格を検討。

## どの Tier かを判定する 3 質問

タスク開始前に:

- **Q1**: 結果は 1 つの context window に収まるか?
  - YES → Tier 1
  - NO → Q2 へ
- **Q2**: 並列調査対象は 2-4 個か?
  - YES → Tier 2 (2-4 subagents)
  - NO → Q3 へ
- **Q3**: 並列調査対象は 5+ 個で、Rule 25 の 5 質問チェックリスト全通過か?
  - YES → Tier 3 (5 subagent + 各 20+ 担当)
  - NO → Tier 2 に降格

## Tier × 期待 token コスト試算

タスク複雑度ごとの実測コスト目安:

- Tier 1 (1 agent): chat 比 **4×** (Rule 25 の Single agent ベース)
- Tier 2 (2-4 subagents): chat 比 **8-12×** (subagent 数に応じて線形)
- Tier 3 (5 subagents): chat 比 **15×** (Anthropic 標準数値)
- Tier 3+ (10 subagents): chat 比 **約 30×** (5 → 10 でほぼ倍化)
- Tier 4 (25+ subagents, antipattern): chat 比 **75×+** (調整失敗で更に膨張)

15× は「払う価値のあるタスクに対する標準コスト」、30× を超える時点で
**そもそも Multi-agent でやるべきタスクかを再検討** すべきです。

## 関連 Rule

- Rule 16: Subagent は他の Subagent を生成できない (フラットツリー)
- Rule 25: 15× コスト + 5 質問チェックリスト (適用判断)
- 本書独自の Tier 4 警告は Anthropic L43 の経験談を実務ガードレールに変換した枠組み
