# Rule 22: Compaction の前に tool result clearing を試せ

> Anthropic Engineering Blog "Effective context engineering for AI agents"
> (2025-09-29) L83-95 が主柱。

## 中心命題

Context window 圧迫時の対処を、**侵襲度の低い順**で 4 階層に並べる:

```
レベル 0: tool result clearing     [最も安全、最も軽い]
レベル 1: /rewind 局所要約
レベル 2: /compact 全体要約 (+ instructions)
レベル 3: /clear リセット          [最後の手段]
```

「context が満杯になったから `/compact` を打つ」一段階運用は、
subtle but critical context を失うリスクがある (Engineering Blog L91)。
本 Rule は 4 階層エスカレーションラダーで対処することを提案する。

## サンプル構成

```
rule22/
├── README.md                                # 本ファイル
├── antipattern/
│   └── auto-compact-only.md                 # /compact 一段階運用の失敗事例
└── fixed/
    ├── escalation-ladder.md                 # 4 階層エスカレーション運用ガイド
    ├── compact-instructions-template.md     # CLAUDE.md の `When compacting:` 例
    └── context-monitoring-hook.sh           # /context 80% 閾値で警告する hook 例
```

## 検証 (Anthropic 公式根拠)

- L93: "One of the safest lightest touch forms of compaction is tool result clearing"
- L89: "The agent can then continue with this compressed context plus the five most recently accessed files."
- L91: "overly aggressive compaction can result in the loss of subtle but critical context"
- commands.md L49 / L51 / L53: `/clear` `/compact` `/context` slash command 仕様
- best-practices.md L201-203: `/compact <instructions>` + `CLAUDE.md` の compaction カスタマイズ
