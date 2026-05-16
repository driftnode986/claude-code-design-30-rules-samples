# Claude Code 設計の30の鉄則 — companion samples

書籍『Claude Code 設計の30の鉄則 — Claude Code を使いこなすためのシステム設計軸』(牧野誠 著、2026 年刊行予定) の動作確認済みサンプル集です。本文中で「アンチパターン」「修正後」として掲載した CLAUDE.md・Hook・設定例の実物を配置しています。

## 使い方

各 Rule のサンプルは Part 番号と Rule 番号で配置されています。

```
ch01-thinking/rule01/     # Rule 01: コンテキストを「有限の予算」として扱う
ch01-thinking/rule02/     # Rule 02: smallest set of high-signal tokens
...
ch02-claude-md/rule06/    # Rule 06: CLAUDE.md は 200行以内に保て
...
```

各 Rule ディレクトリの典型構成:

```
ruleNN/
├── README.md             # この Rule の趣旨と検証方法
├── bad/                  # アンチパターン (本文掲載の実物)
│   └── CLAUDE.md
└── good/                 # 修正後 (本文掲載の実物)
    └── CLAUDE.md
```

## ディレクトリマップ

| Part | テーマ | ディレクトリ | 対応 Rule |
|------|--------|------------|----------|
| Part 1 | 思想と前提 | `ch01-thinking/` | Rule 01-05 |
| Part 2 | CLAUDE.md の鉄則 | `ch02-claude-md/` | Rule 06-10 |
| Part 3 | Skills / Hooks / Subagents | `ch03-skills-hooks/` | Rule 11-16 |
| Part 4 | Tool / MCP 設計 | `ch04-tool-mcp/` | Rule 17-21 |
| Part 5 | 長期セッションと「ハーネスエンジニアリング」 | `ch05-harness/` | Rule 22-26 |
| Part 6 | セキュリティと権限 | `ch06-security/` | Rule 27-28 |
| Part 7 | 失敗から学ぶ運用 | `ch07-ops/` | Rule 29-30 |
| 付録 | 30の鉄則チェックリスト | `templates/` | — |

## 検証環境

サンプルは以下の環境で動作確認しています。

- Claude Code CLI v2.x (各 Rule の README に検証バージョンを記載)
- macOS 14 / Linux (Ubuntu 22.04)
- Node.js 20.x

## ライセンス

書籍購入者向けのサンプルコードです。書籍に掲載された範囲での参照・改変・自身のプロジェクトへの組み込みは自由です。コード自体の再配布・販売は禁じます。

## 関連

- 書籍 Amazon ページ (出版後リンク): 未定
- 著者: 牧野 誠
