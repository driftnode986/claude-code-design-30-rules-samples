# Rule 02: "Smallest set of high-signal tokens" を探す

## このサンプルで何を見せるか

Rule 01 で「コンテキストは有限の予算」と認めた次に来るのは、「予算配分」の問題。Anthropic Engineering Blog "Effective context engineering for AI agents" (2025-09-29) の中核フレーズはこれ:

> Given that LLMs are constrained by a finite attention budget, *good* context engineering means finding the *smallest* *possible* set of high-signal tokens that maximize the likelihood of some desired outcome.

「最小であって短いとは限らない (minimal does not necessarily mean short)」という Anthropic 自身の警句がポイント。短さを目的にすると altitude (高度・粒度) が崩れ、別の失敗を引き起こす。

このディレクトリでは 2 つの軸を bad/good 比較する:

### 軸 1: system prompt の altitude (高度)

- `bad/system-prompt.md` — altitude が混在 (片方ではブランチ条件をハードコード、もう片方では「うまくやって」とだけ書く)
- `good/system-prompt.md` — 全体を同じ altitude で書き、「何を期待し、何を判断材料にせよ」を明示

### 軸 2: ツール集合の最小化

- `bad/tools.json` — 役割が重なる 8 ツール (`search_file` / `find_file` / `glob_file` / `grep_file` / `locate_file` ...)
- `good/tools.json` — 直交する 5 ツールに絞り、それぞれ「いつ使うか」が即答できる

## 検証方法

system prompt は実プロジェクトの `.claude/agents/<name>.md` または Claude Developer Platform の system prompt に貼って使う想定。tools.json は Claude Developer Platform の Tool Use API で送る tool definitions の構造例。

実機検証は本書の趣旨 (思想編) からは外れるので、**「Claude Code が読める JSON / Markdown として valid」「人間のエンジニアが読んで bad/good の差を即答できる」の 2 点で十分**としている。

## なぜ few-shot examples と message history のサンプルを含めないか

主柱記事の 4 軸 (system prompts / tools / examples / message history) のうち:

- few-shot examples: 「edge case 羅列ではなく canonical example を厳選」という原則は本文の解説のみで十分伝わる
- message history: tool result clearing や compaction は本書 Part 5 (Rule 22) で本格扱いするため、Rule 02 では言及だけにとどめる

「サンプルは本文の説明を補強する目的のものだけを置く」という Rule 02 自身の原則 (informative, yet tight) に従う。

## 検証バージョン

- Claude Code CLI: v2.x
- 確認日: 2026-05-17
