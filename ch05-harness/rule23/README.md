# Rule 23: initializer + coding の二段「ハーネス」にせよ

> Anthropic Engineering Blog "Effective harnesses for long-running agents"
> (2025-11-26) L11, L27-31 が主柱。公式 quickstart リポジトリ:
> https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding

## 中心命題

長期セッションを支えるエージェントは、**初期プロンプトだけが違う**
2 種類のセッションで運用する。

1. **initializer agent**: 環境を作る (一度だけ実行)
   - `init.sh`: dev server 起動 + E2E test
   - `claude-progress.txt`: agent 作業ログ
   - `feature_list.json`: 200+ features を `passes: false` 初期マーク
   - 初期 git commit
2. **coding agent**: 機能を実装する (毎セッション)
   - `pwd` + `read claude-progress.txt` + `read feature_list.json` で get bearings
   - `init.sh` 起動 + E2E test
   - 1 feature ずつ実装 → git commit + progress 更新

両者は **system prompt / tool set / harness が同一** で、
**最初のユーザープロンプトだけ** が違う (Engineering Blog 脚注 L127)。

## 4 要素アーキ

```
project_root/
├── init.sh                 # dev server 起動 + E2E test
├── claude-progress.txt     # agent 作業ログ (毎セッション追記)
├── feature_list.json       # 200+ features の進捗 (passes: true/false)
└── .git/                   # コード state + コミット履歴
```

## サンプル構成

```
rule23/
├── README.md                          # 本ファイル
├── antipattern/
│   └── single-session-prompt.md       # /clear ループのみで運用する失敗例
└── fixed/
    ├── initializer-prompt.md          # initializer 用プロンプトテンプレ
    ├── coding-prompt.md               # coding agent 用プロンプトテンプレ
    ├── feature-list-example.json      # 10 features の最小サンプル
    ├── init.sh.example                # dev server 起動 + E2E test の例
    └── claude-progress.txt.example    # 3 セッション分の progress entry
```

## 公式根拠

- L11: "two-fold solution: an initializer agent ... and a coding agent"
- L27-29: 4 要素アーキ (init.sh + claude-progress.txt + initial git commit + feature_list.json)
- L31: "knowing what effective software engineers do every day"
- L35: Claude 4 prompting guide の "a different prompt for the very first context window"
- L56: "JSON is less likely to inappropriately change or overwrite ... compared to Markdown"
- L80-86: coding agent の get-its-bearings 3 ステップ
- L88: init.sh + E2E test before new feature
- L93-105: 典型的なセッション開始シーケンス
- L127: 脚注「別人格ではなく初期プロンプトの違いだけ」
