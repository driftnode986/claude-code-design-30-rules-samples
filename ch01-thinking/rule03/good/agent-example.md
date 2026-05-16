# Bug Investigation & Fix (GOOD: Agent として設計)

「ユーザーが報告した不具合を調査して、原因を特定し、修正 PR を出す」タスクを Agent として組む。
Anthropic Engineering Blog の Agent 定義どおり、Claude Code が「LLM のツール使用ループ」として動く。

## なぜ Agent か

このタスクは:

- ステップ数が事前に予測できない (再現に 3 ステップで済む不具合もあれば、20 ステップ追跡が必要な不具合もある)
- 必要なツール (read_file / grep / run_test / git_log / read_logs ...) は同じでも、呼ぶ順序がケースごとに違う
- 中間結果から次の調査方針を立てる必要がある (「ログを見たら認証で失敗、では認証コードを読む」)

Anthropic Engineering Blog はこういうタスクに対する処方を明確に示している:

> Agents can be used for open-ended problems where it's difficult or impossible to predict the required number of steps, and where you can't hardcode a fixed path. The LLM will potentially operate for many turns, and you must have some level of trust in its decision-making.

「バグ調査・修正」はこの定義にそのまま当てはまる。

## Agent の設計

Claude Code セッションを以下のように立ち上げる (pseudocode 相当)。

```markdown
# .claude/agents/bug-investigator.md

あなたは経験豊富なバックエンドエンジニアとして、ユーザーから報告された不具合を調査します。

## タスク

ユーザーから渡される `incident.md` を読み、以下を達成してください:

1. 不具合の再現条件を確定する (ログ・コード・テストを根拠に)
2. 根本原因 (root cause) を特定する (症状ではなく原因)
3. 修正案を 1 つ以上提案する (複数あれば trade-off を添える)
4. 採用された修正案について、テストを追加した上で修正 PR を出す

## 利用できるツール

- read_file / list_directory / grep_content (リポジトリ調査)
- run_command (テスト実行・型チェック・git 操作)
- read_logs (Datadog / Sentry / 本番ログを参照)
- git_pr_create (修正 PR を出す)

## 進め方

- 最初に再現を試みる。再現できなければ、なぜ再現できないかを書く (環境差・データ差)
- 仮説を立てたら、それを支持/反証する情報を集めて検証する
- 「分からない」と感じたら ユーザーに質問を返す (推測で進めない)
- 修正 PR を出す前に、必ずローカルでテストを通す

## 停止条件

- 修正 PR を出して CI が通ったら完了
- 5 ターン以内に再現できない、または原因の方向性が見えない場合は、現時点で分かっていることをまとめてユーザーに返す (無限ループしない)
```

## ポイント

- **方向付けは Claude Code 自身**: ステップ 1〜4 の達成方法は Claude Code が動的に決める。「ログを先に見るか、コードを先に grep するか」は Claude Code が判断する
- **ツールセットは確定**: 利用できるツール群は事前に絞り込んでおく (Rule 02 のツール最小化原則)。Claude Code は「どのツールを呼ぶか」だけ動的に決め、「どんなツールがあるか」は決めない
- **停止条件を明示**: Agent の「higher costs, compounding errors」を抑えるため、ターン上限 (5 ターン) と完了条件を system prompt に書く
- **人間への戻り**: 「分からないなら推測しない」「ユーザーに質問を返す」 → Anthropic 言うところの「Agents can then pause for human feedback at checkpoints or when encountering blockers」
- **transparency の確保**: Claude Code のプランニングステップを人間が読める形で残す (TodoWrite で進捗を追えるようにする)

## いつ Agent から Workflow に戻すか

このタスクが「実はパターン化できる」と分かった瞬間に Workflow に格下げするべき:

- 同じ症状の不具合が 3 件続けて起き、再現手順が同型になった → 専用 Workflow を `scripts/repro_<pattern>.py` に固める
- 「ログを見て該当行を grep する」だけで原因が分かるパターンが定型化した → そこは Workflow ステップにして、Agent には別のことに集中させる

Agent と Workflow は排他ではなく階層的に組める。本タスクの「最終 PR 作成」だけを Workflow ステップにして (`gh pr create` のテンプレを固定)、調査部分だけ Agent に任せる、というハイブリッドが現実的な落とし所になることが多い。
