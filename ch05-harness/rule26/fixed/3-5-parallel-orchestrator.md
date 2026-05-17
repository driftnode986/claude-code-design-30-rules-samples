# 修正後: 3-5 subagent 並列の lead agent prompt

## 標準構成

3-5 subagent を 1 階層 (フラットツリー) で並列起動し、各 subagent 内で 3+ ツールを
並列実行する Anthropic 推奨パターン。

## orchestrator-prompt.md

```markdown
You are a lead research orchestrator. The user wants funding information for
100 Japanese AI startups in the past 12 months.

Spawn 5 subagents in parallel, dividing 100 companies into 5 groups of 20:

1. **subagent-group-A**: 株式会社 1 〜 20 (alphabetical)
2. **subagent-group-B**: 株式会社 21 〜 40
3. **subagent-group-C**: 株式会社 41 〜 60
4. **subagent-group-D**: 株式会社 61 〜 80
5. **subagent-group-E**: 株式会社 81 〜 100

Each subagent's task (clearly delegated, per Anthropic L47):

- **Objective**: 担当 20 社の最新ファンディング情報を収集する
- **Output format**: JSON array of `{company_name, funding_round, amount_jpy, lead_investor, announced_at}`
- **Tools/sources**: PR TIMES API + 日経新聞 + Crunchbase + 会社公式 IR ページ
- **Task boundaries**:
  - 担当 20 社のみ調査 (他 subagent との重複を避ける)
  - 過去 12 ヶ月の最新ラウンドのみ (それ以前は省略)
  - 確認できない場合は `null` を返す (推測で埋めない)

各 subagent は内部で **3+ tools in parallel** を使うこと (Anthropic L59):
- PR TIMES API + 日経新聞 + Crunchbase を同時実行
- 結果をマージして 20 社分の JSON を構築

戻り値は **1 subagent あたり 1,000-2,000 トークン以内** に圧縮 (L109)。
詳細な調査ログは subagent 内で破棄、最終 JSON のみ lead に返す。

集約: lead agent が 5 subagent の戻り値を merge して 100 社の単一 JSON 配列を構築。
```

## なぜこの構成が最適か

| 観点 | 5 subagent 構成 | 25 subagent 構成 (antipattern) |
|------|----------------|------------------------------|
| token コスト | 約 15× (Rule 25 標準) | 約 75×+ (実測はもっと膨張) |
| 同期実行ボトルネック | 5 subagent の最遅 = 全体律速 | 25 subagent で激化 |
| Coordination 複雑度 | 5 戻り値の merge | 25 戻り値で context overflow |
| 重複作業リスク | 担当社境界が明確 | 別名・略称での重複多発 |
| エラー復旧 | 1 失敗で 4 維持 + 1 再試行 | 1 失敗で残り 24 を待つか諦めるか |

## Subagent 内の 3+ ツール並列 (2 段目の並列化)

Anthropic L59 が示す 2 段並列化:

1. **lead agent → 3-5 subagent 並列起動** (1 段目)
2. **各 subagent → 3+ ツール並列実行** (2 段目)

合計の実効並列度:
- 5 subagent × 3 ツール = **15 並列実行**
- 25 subagent × 1 ツール (調整失敗で) = 実効 10 並列以下

5 subagent でも 25 subagent の 1.5 倍の実効並列度を確保しつつ、調整コストは
1/5 で済みます。

## 削減できた指標 (Anthropic L59 から)

> These changes cut research time by up to 90% for complex queries

(著者訳) これらの変更により複雑なクエリのリサーチ時間が最大 90% 短縮されました。

3-5 subagent + 各 subagent 内 3+ ツール並列の組み合わせが、Anthropic が
production で発見した **時間 90% 短縮 + コスト 15× 標準** のスイートスポットです。
