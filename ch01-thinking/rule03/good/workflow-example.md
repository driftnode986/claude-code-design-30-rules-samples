# Release Notes Generator (GOOD: Workflow として設計)

「直近 1 週間分のマージ済み PR からリリースノートを書く」タスクを Workflow として組む。
Anthropic Engineering Blog の Workflow パターンのうち、Prompt chaining + Evaluator-optimizer の組み合わせ。

## なぜ Workflow か

このタスクは:

- ステップが事前に予測できる (PR 取得 → 要約 → 分類 → 整形 → 検証)
- 予測可能性と一貫性が重要 (週次で同じフォーマットになるべき)
- 失敗箇所が特定しやすい (どのステップで失敗したか追える)

Anthropic Engineering Blog はこういうタスクに対する処方を明確に示している:

> Workflows offer predictability and consistency for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed at scale.

「リリースノート生成」は前者に該当する。

## Workflow の構造

`scripts/release-notes.py` のような定義済みコードパスで以下を順に実行する (pseudocode)。

```python
# Step 1: PR 取得 (LLM 不使用、確定的)
prs = run("gh pr list --state merged --search 'merged:>=2026-05-10' --json number,title,body,labels")

# Step 2: PR ごとに「3 行要約」を生成 (Prompt chaining)
# 各 PR に対して LLM を 1 回呼ぶ。Subagent ではなく単一 LLM 呼び出し
summaries = []
for pr in prs:
    summary = llm_call(
        system_prompt=load_template("release_notes/step_summarize.md"),  # 確定したテンプレ
        user_message=f"PR #{pr.number}: {pr.title}\n\n{pr.body}",
    )
    summaries.append({"pr": pr.number, "summary": summary})

# Step 3: ラベルベースで分類 (LLM 不使用、確定的)
# 「feature / fix / docs / chore」のラベルが付いている前提で、コードで振り分ける
categorized = group_by_label(summaries, prs)

# Step 4: 各カテゴリ内で並び替え + 整形 (LLM 1 回呼び出し、テンプレ指定)
formatted = llm_call(
    system_prompt=load_template("release_notes/step_format.md"),  # フォーマットを完全に指定
    user_message=json.dumps(categorized),
)

# Step 5: Evaluator-optimizer ループで品質チェック
# 別のテンプレで「3 つの観点」(網羅性 / 一貫性 / 読みやすさ) で評価
for iteration in range(3):  # 最大 3 回
    evaluation = llm_call(
        system_prompt=load_template("release_notes/step_evaluate.md"),
        user_message=formatted,
    )
    if evaluation.score >= 0.85:
        break
    # フィードバックを反映して再生成
    formatted = llm_call(
        system_prompt=load_template("release_notes/step_format.md"),
        user_message=f"{categorized}\n\n直前の出力:\n{formatted}\n\n改善指示:\n{evaluation.feedback}",
    )

# Step 6: 出力
write_file("RELEASE_NOTES.md", formatted)
```

## ポイント

- **各ステップが独立**: Step 2 で 30 件分の LLM 呼び出しが失敗しても、再開地点が明確
- **テンプレが固定**: `step_summarize.md` `step_format.md` `step_evaluate.md` は人間が書いて版管理する。週次で勝手に変わらない
- **Subagent ではなく単一 LLM 呼び出し**: 各ステップで Claude Sonnet 4.6 などを直接呼ぶ。Subagent のオーバーヘッド (本書 Rule 25) を避ける
- **Evaluator-optimizer で品質ループ**: Anthropic Workflow パターンの 5 番目を採用。最大 3 回で打ち切ることで cost も予測可能
- **Claude Code から実行する場合**: `bash scripts/release-notes.py` を Claude Code に頼んで実行させる。Claude Code 自身が「方向付け」する余地はないが、それで正解 (このタスクには柔軟性が不要)

## いつ Workflow を外して Agent に切り替えるか

本タスクが Workflow ではダメになるのは:

- PR の中身を読まないと「カテゴリ」が決まらないようなプロジェクト (ラベル運用がないチーム)
- リリースノートに「ユーザー影響度」「依存ライブラリへの影響」など、PR を超えて他コミット・他リポジトリを見ないと書けない情報を含めたいとき

その場合は、Claude Code 自身に「どの情報を集めるか」「どう書くか」を方向付けさせる Agent 設計に切り替える (= `good/agent-example.md`)。ただし、その代償として「週次でフォーマットが揺れる」「実行コストが高い」を引き受けることになる。
