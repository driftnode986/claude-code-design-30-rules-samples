# Claude Code 設計の30の鉄則 — サンプルコード

書籍『Claude Code 設計の30の鉄則 — Claude Code を使いこなすためのシステム設計軸』(牧野 誠 著、2026 年刊行) のサンプルコードを **動作確認済み** で配置したリポジトリです。本文中で「アンチパターン」「修正後」として掲載した CLAUDE.md・Hook・Skill・Subagent 定義・設定例の実物を、コピペで利用できる形で置いています。

## 読者の方へ

本書を読みながら参照する想定です。

- **特定の Rule のサンプルを見たい** → 下の [Rule 早見表](#rule-早見表) から該当ディレクトリへ
- **本書のどの箇所のコードか** → 各 Rule の `README.md` 冒頭に Rule タイトルと出典 URL を記載
- **自分のプロジェクトに導入したい** → `*/fixed/` (Rule 04-30) または `*/good/` (Rule 01-03) のファイルを雛形にしてください

## ディレクトリ命名規則

各 Rule は `chXX-xxx/ruleNN/` の下に「悪い例」と「修正後」を 2 ディレクトリで配置しています。**Rule によって名前が違う点に注意**してください (本書本文の表記と一致させています)。

| Rule 範囲 | 悪い例 | 修正後 |
|----------|-------|-------|
| Rule 01-03 | `bad/` | `good/` |
| Rule 04-30 | `antipattern/` | `fixed/` |

意味は同じです。Rule 01-03 はシリーズ最初期に作成したため `bad/good` のままにしてあり、本書本文の引用パスとも一致しています。

## Rule 早見表

### Part 1: 思想と前提

- Rule 01: コンテキストを「有限の予算」として扱う → [`ch01-thinking/rule01/`](ch01-thinking/rule01/)
- Rule 02: "Smallest set of high-signal tokens" を探す → [`ch01-thinking/rule02/`](ch01-thinking/rule02/)
- Rule 03: Workflow か Agent か。二項対立で考える → [`ch01-thinking/rule03/`](ch01-thinking/rule03/)
- Rule 04: 最も単純な解から始めよ → [`ch01-thinking/rule04/`](ch01-thinking/rule04/)
- Rule 05: "Explore → Plan → Code → Commit" を絶対のリズムにする → [`ch01-thinking/rule05/`](ch01-thinking/rule05/)

### Part 2: CLAUDE.md の鉄則

- Rule 06: CLAUDE.md は 200 行以内に保て → [`ch02-claude-md/rule06/`](ch02-claude-md/rule06/)
- Rule 07: 削除自問テストでプルーニングする → [`ch02-claude-md/rule07/`](ch02-claude-md/rule07/)
- Rule 08: プロジェクト固有の罠を書け → [`ch02-claude-md/rule08/`](ch02-claude-md/rule08/)
- Rule 09: 矛盾する指示を書くな → [`ch02-claude-md/rule09/`](ch02-claude-md/rule09/)
- Rule 10: `@import` は起動時コンテキストを減らさない → [`ch02-claude-md/rule10/`](ch02-claude-md/rule10/)

### Part 3: Skills / Hooks / Subagents の使い分け

- Rule 11: 3 軸 (コンテキスト分離 / 副作用 / 再利用) で選ぶ → [`ch03-skills-hooks/rule11/`](ch03-skills-hooks/rule11/)
- Rule 12: Skill は使うときだけ読まれる → [`ch03-skills-hooks/rule12/`](ch03-skills-hooks/rule12/)
- Rule 13: Subagent はコンテキスト分離が目的、Skill は知識注入が目的 → [`ch03-skills-hooks/rule13/`](ch03-skills-hooks/rule13/)
- Rule 14: Hook で絶対実行を書け → [`ch03-skills-hooks/rule14/`](ch03-skills-hooks/rule14/)
- Rule 15: PreToolUse hook で最後の砦を実装 → [`ch03-skills-hooks/rule15/`](ch03-skills-hooks/rule15/)
- Rule 16: サブエージェントは他のサブエージェントを生成できない → [`ch03-skills-hooks/rule16/`](ch03-skills-hooks/rule16/)

### Part 4: Tool / MCP 設計の鉄則

- Rule 17: 人間でも判別できないなら AI も判別できない → [`ch04-tool-mcp/rule17/`](ch04-tool-mcp/rule17/)
- Rule 18: Tool には namespace prefix を付けよ → [`ch04-tool-mcp/rule18/`](ch04-tool-mcp/rule18/)
- Rule 19: Tool は絶対パスを要求しろ → [`ch04-tool-mcp/rule19/`](ch04-tool-mcp/rule19/)
- Rule 20: MCP は「コードで呼べ」(98.7% 削減) → [`ch04-tool-mcp/rule20/`](ch04-tool-mcp/rule20/)
- Rule 21: ResponseFormat enum で detailed/concise を切り替えろ → [`ch04-tool-mcp/rule21/`](ch04-tool-mcp/rule21/)

### Part 5: 長期セッションと「ハーネスエンジニアリング」

- Rule 22: Compaction の前に tool result clearing を試せ → [`ch05-harness/rule22/`](ch05-harness/rule22/)
- Rule 23: initializer + coding の二段「ハーネス」にせよ → [`ch05-harness/rule23/`](ch05-harness/rule23/)
- Rule 24: progress.txt + git commit でセッション handoff を設計 → [`ch05-harness/rule24/`](ch05-harness/rule24/)
- Rule 25: Multi-agent は通常チャットの 15 倍トークンを消費する → [`ch05-harness/rule25/`](ch05-harness/rule25/)
- Rule 26: サブエージェントの並列起動は 3-5 が上限 → [`ch05-harness/rule26/`](ch05-harness/rule26/)

### Part 6: セキュリティと権限の鉄則

- Rule 27: Filesystem 分離 + Network 分離の両方が必要 → [`ch06-security/rule27/`](ch06-security/rule27/)
- Rule 28: 自動モードの Conversational boundary を活用する → [`ch06-security/rule28/`](ch06-security/rule28/)

### Part 7: 失敗から学ぶ運用の鉄則

- Rule 29: 「ハーネス」の黙った最適化を信用するな (effort 明示) → [`ch07-ops/rule29/`](ch07-ops/rule29/)
- Rule 30: Fail twice rule — 同じ修正を 2 回繰り返したら `/clear` → [`ch07-ops/rule30/`](ch07-ops/rule30/)

### 付録

- [`templates/`](templates/) — 30 の鉄則 1 枚チェックリスト

## Rule ディレクトリの典型構成

```
ruleNN/
├── README.md           # Rule タイトル・本書出典・公式根拠 URL・サンプルの趣旨
├── bad/ または antipattern/    # 悪い例 (本文の「アンチパターン」セクションに対応)
│   └── CLAUDE.md など
└── good/ または fixed/         # 修正後 (本文の「修正後」セクションに対応)
    └── CLAUDE.md など
```

Skills / Hooks / Subagents 系の Rule では `.claude/skills/<name>/SKILL.md`、`.claude/hooks/`、`.claude/agents/*.md`、`.claude/settings.json` といった本書で使う実物の配置になっています。

## 検証環境

サンプルは以下の環境で動作確認しています (詳細は各 Rule の `README.md` に記載)。

- Claude Code CLI v2.x
- macOS 14 / Linux (Ubuntu 22.04)
- Node.js 20.x

公式仕様は更新が頻繁です。動作しなくなった場合は Issue でお知らせください。

## ライセンス

書籍購入者向けのサンプルコードです。書籍に掲載された範囲での参照・自身のプロジェクトへの組み込み・改変は自由です。コード自体の再配布・販売は禁じます。

## 関連

- 書籍 Amazon ページ: 出版後に追記します
- 著者: 牧野 誠 (`makino_makoto`)
- 既刊 (シリーズ): Claude Code マルチエージェント実践ガイド / 非エンジニアの Claude Cowork 仕事術 / Claude Code × Playwright MCP 実践ガイド / AWS DVA-C02 試験対策 / AWS CLF-C02 試験対策

## フィードバック

誤りや改善提案は GitHub Issue / Pull Request でお寄せください。本書の出版後も継続して保守する予定です。
