# 修正後: Multi-agent が割に合う適用例 — 競合リサーチ

## 状況

Multi-agent が向く典型例。Anthropic Engineering Blog の S&P 500 取締役全員調査
(L23) と同型で、heavy parallelization + single context window 超過 + 多数のツールが
揃ったケース。

「日本の主要 KDP 出版社の最近 6 ヶ月の新刊を 30 タイトル分析し、価格戦略・
カテゴリ配置・キーワード傾向をまとめたい」というリサーチタスク。

## orchestrator-prompt.md

```markdown
You are a lead research orchestrator. The user wants a competitive analysis of
the top KDP publishers in Japan over the past 6 months.

Spawn 5 subagents in parallel, each researching a different publisher:

1. **subagent-publisher-A**: 出版社 A の最近 6 ヶ月新刊 (Amazon 検索 + amazon.co.jp 商品ページ)
2. **subagent-publisher-B**: 出版社 B (同上)
3. **subagent-publisher-C**: 出版社 C (同上)
4. **subagent-publisher-D**: 出版社 D (同上)
5. **subagent-publisher-E**: 出版社 E (同上)

各 subagent は以下を抽出し、structured JSON で返すこと:

- 新刊リスト (タイトル / ASIN / 価格 / カテゴリ / 発売日)
- 価格レンジの中央値
- 上位 3 カテゴリ
- 上位 7 キーワード

返却は **必ず 1,000-2,000 トークン以内** に圧縮すること
(各 subagent は数万トークン使って良いが、戻り値は要約のみ)。
```

## なぜこのタスクは Multi-agent 適用 OK か

| 条件 | このタスク | 評価 |
|------|----------|------|
| heavy parallelization | 5 出版社は完全独立で並列調査可能 | ✅ |
| context window 超過 | 各社 30 新刊 × 商品ページ全文 = 数十万トークン | ✅ |
| 多数の複雑ツール | Amazon 検索 + 商品ページ extract + 価格 / カテゴリ抽出 | ✅ |
| 共有 context 不要 | 出版社 A の調査は B-E に影響しない | ✅ |
| agent 間依存なし | 各 subagent は完全独立 | ✅ |
| リアルタイム調整不要 | lead agent は結果集約のみ | ✅ |

## コスト試算

- chat 1 回想定: 5,000 トークン (普通の質問応答)
- single agent でやる場合: 5,000 × 4 = 20,000 トークン (1 agent が逐次調査)
- multi-agent でやる場合: 5,000 × 15 = 75,000 トークン (lead + 5 subagent 並列)

差: **約 55,000 トークン** (約 3.75 倍の上乗せ)

このコストが正当化される理由:
- single agent では context window に収まらない (5 社 × 30 新刊 = 150 商品ページ)
- 並列化により所要時間が 1/5 (Anthropic L59 の「90% 時間短縮」と整合)
- リサーチ結果の **価値** が「マーケット参入判断」に直結 (経済合理性 OK)

## チェック: 自分のタスクは Multi-agent 適用すべきか

`fixed/cost-fit-checklist.md` の 5 質問に答えて判定する。
