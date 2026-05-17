# Orchestrator Delegation Template

> Anthropic Engineering Blog "How we built our multi-agent research system"
> (2025-06-13) L47 の「objective + output format + tool guidance + task
> boundaries」4 要素を実務用テンプレに整形。

## 原理 (L47 直接引用)

> Each subagent needs an objective, an output format, guidance on the
> tools and sources to use, and clear task boundaries. Without detailed
> task descriptions, agents duplicate work, leave gaps, or fail to find
> necessary information.

各 subagent には 4 要素 (目的・出力形式・ツールガイダンス・タスク境界) を
必ず明示する。曖昧な指示は重複作業・空白・取りこぼしの原因になる。

## テンプレ

```markdown
You are subagent-{role}. Your task:

### 1. Objective (目的)
<何を達成すべきかの一文>

### 2. Output Format (出力形式)
<JSON schema / Markdown structure / etc.>

\`\`\`json
{
  "field_a": "...",
  "field_b": "..."
}
\`\`\`

### 3. Tools & Sources (使用ツール / 情報源)
- <tool 1>: <用途>
- <tool 2>: <用途>
- <優先順位 / 信頼性順位>

### 4. Task Boundaries (タスク境界)
- 担当範囲: <何を含むか>
- 範囲外: <何を含まないか、他 subagent と境界が重ならないように>
- 不明な場合の挙動: <推測しない / null を返す / lead agent に報告>
- 戻り値の上限: <1,000-2,000 トークン以内に圧縮>

### 5. Quality Checks (品質チェック)
- <成果物が空でないか>
- <フィールドが全て埋まっているか、null は妥当か>
- <出典が信頼できるか>
```

## 適用例: 100 社ファンディング調査の subagent-group-A

```markdown
You are subagent-group-A. Your task:

### 1. Objective
日本の AI スタートアップ 100 社のうち、担当 20 社 (株式会社 1-20) の
過去 12 ヶ月の最新ファンディング情報を収集する。

### 2. Output Format

\`\`\`json
[
  {
    "company_name": "株式会社 X",
    "funding_round": "Series A / B / C / Seed / null",
    "amount_jpy": 500000000,
    "lead_investor": "VC 名 or null",
    "announced_at": "YYYY-MM-DD",
    "source_url": "https://..."
  }
]
\`\`\`

### 3. Tools & Sources
- PR TIMES API: 一次情報、信頼性 高
- 日経新聞: 一次情報、信頼性 高
- Crunchbase: 二次情報、英語ソース、信頼性 中
- 会社公式 IR ページ: 最後の確認用、信頼性 最高

並列実行: 3 ツールを **同時呼び出し** し、結果を統合する (Anthropic L59 の
3+ tools in parallel パターン)。

### 4. Task Boundaries
- **担当**: 株式会社 1, 2, 3, ..., 20 のみ (リストは別紙)
- **範囲外**: 株式会社 21 以降 (他 subagent 担当)
- **時期**: 過去 12 ヶ月以内のラウンドのみ
- **不明な場合**: 確認できないフィールドは `null`、推測で埋めない
- **戻り値上限**: 1,500 トークン以内 (20 社 × 75 トークン目安)

### 5. Quality Checks
- 20 社全てがリストに含まれているか
- 各社の `funding_round` または `null` が明示されているか
- 出典 URL が公開アクセス可能か
- 金額単位が JPY で統一されているか
```

## チェックリスト: 各 subagent prompt を書く前に

- [ ] **Objective**: 1 文で言い切れるか? 「複数のことをやって」は NG
- [ ] **Output Format**: lead agent が後で merge できる構造か? 自由形式テキストは NG
- [ ] **Tools & Sources**: 並列実行可能なツールが 3+ あるか? なければ tier 2 に降格
- [ ] **Task Boundaries**: 他 subagent と重複しないか? 「念のため周辺も」は NG
- [ ] **Quality Checks**: subagent 自身が成果物を検証する基準があるか?

5 つ全て埋められないなら、その subagent は spawn する前に prompt 設計を
やり直すべきです。

## なぜこのテンプレが効くか

Anthropic L47 が示す失敗パターン:

> We started by allowing the lead agent to give simple, short instructions
> like 'research the semiconductor shortage,' but found these instructions
> often were vague enough that subagents misinterpreted the task or
> performed the exact same searches as other agents.

(著者訳) 私たちは当初、lead agent が「半導体不足を調査せよ」のような短い指示を
与えることを許していました。しかし、これらの指示は曖昧で、subagent がタスクを
誤解したり、他の subagent と同じ検索を実行したりすることがしばしばありました。

4 要素を明示する prompt は、subagent の自由度を意図的に絞ることで重複と
空白を防ぎます。「自由度を与えると暴走する」のは Anthropic L43 の 50 subagents
事例と同じ構造で、prompt engineering で制御することが推奨されます。

## 関連 Rule

- Rule 16: Subagent は他の Subagent を生成できない
- Rule 17: 「人間でも判別できないなら AI も判別できない」(Output Format の精度と直結)
- Rule 25: 15× コスト + 5 質問チェックリスト
- Rule 26: 3-5 並列上限 + 複雑性スケーリング
