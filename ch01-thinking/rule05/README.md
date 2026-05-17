# Rule 05: "Explore → Plan → Code → Commit" を絶対のリズムにする

## このサンプルで何を見せるか

Anthropic Engineering Blog "Best practices for Claude Code" は、Claude Code との対話の最小単位として 4 段階のリズムを提示している:

1. **Explore** — 関連ディレクトリと既存パターンを Claude に読ませる
2. **Plan** — 触るファイル・session flow・テスト計画を Claude に書き出させる (Ctrl+G でエディタ編集可)
3. **Implement** — Plan の通り実装、同時にテストを書かせて全通過まで
4. **Commit** — 説明的なメッセージで commit、PR を開く

このディレクトリには次の 2 構成を置く:

- `antipattern/one_shot_prompt.txt` — 「OAuth ログイン追加して」の 1 行プロンプトで 28 ファイル変更されるケース (Plan / Commit checkpoint なし、テスト失敗時に追跡不能)
- `fixed/` — 同じ要件を 4 つの分離されたターンで進めるプロンプト集

## fixed/ ディレクトリの中身

- `1_explore.txt` — `@src/auth` `@src/middleware` を読ませて既存パターンを整理させる
- `2_plan.txt` — Plan を文章として書き出させる + Ctrl+G で人間が直接編集
- `3_implement.txt` — 編集後の Plan の通り実装 + テスト同時実行 + 逸脱は理由必須
- `4_commit.txt` — Plan を含む commit メッセージ + レビュアー向け diff 読み順
- `skip_plan.txt` — Plan を飛ばしてよい例外条件 (一文 diff / 単一ファイル / 既存パターン素直適用)

## Plan を飛ばしてよい判断ライン

公式は次のように書いている:

> If you could describe the diff in one sentence, skip the plan.

本書での実務基準は「一文 diff」「単一ファイル」「既存パターンの素直な適用」のうち 2 つ以上を満たすときに限り Plan を省略する。

## 期待される効果

- Implement 段階前に「触るファイル」と「テスト計画」を人間が把握できる
- Plan からの逸脱を Claude が説明するため、レビューが容易
- Commit メッセージに Plan の項目が残り、半年後の `git log` で意図が追える
- テスト失敗時に「どの中間 checkpoint まで戻ればよいか」が即座に分かる

## 関連 Rule

- Rule 03「Workflow か Agent か」 — 4 段階リズムは Workflow パターンの最小単位
- Rule 04「最も単純な解から始めよ」 — 4 段階を 4 ターンに分けることが単純さの実装
- Rule 22「Compaction の前に tool result clearing を試せ」 — 4 段階の合間にコンテキスト整理
- Rule 23「initializer + coding の二段ハーネス」 — 4 段階リズムを長期セッションに拡張
- Rule 24「progress.txt + git commit で handoff」 — Commit 段階の延長
- Rule 30「Fail twice rule」 — Implement で 2 回失敗したら Explore からやり直す

## 参考文献

- Anthropic Engineering Blog "Best practices for Claude Code". https://www.anthropic.com/engineering/claude-code-best-practices
- Anthropic Engineering Blog "Building effective agents" (2024-12-19). https://www.anthropic.com/engineering/building-effective-agents (三原則 Simplicity / Transparency / ACI design)
