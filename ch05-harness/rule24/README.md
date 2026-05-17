# Rule 24: progress.txt + git commit でセッション handoff を設計

> Anthropic Engineering Blog "Effective harnesses for long-running agents"
> (2025-11-26) L27, L31, L97 が主柱。Rule 23 で扱った二段「ハーネス」の
> **永続化レイヤの中身** にフォーカスする。

## 中心命題

長期セッションを「同じ作業の続き」として認識させる handoff は、
**3 つの永続化レイヤ** で構成する。

| 層 | ファイル | 形式 | 目的 |
|---|---------|------|------|
| L1 ナラティブ | `claude-progress.txt` | Markdown / プレーンテキスト | why の記録 (人間の判断ログ) |
| L2 状態 | `git history` | git commit | what の記録 (コードの真実) |
| L3 構造化進捗 | `feature_list.json` | JSON | 機械可読の PASS / FAIL 一覧 |

3 層は **相補的**。どれか 1 つを欠くと fresh context window の coding agent が
作業を再開できない。

## なぜ 3 層か

- **L1 だけ**: 「実装したと書いてあるのに、コードが無い」事故が起こる
- **L2 だけ**: 「なぜそうしたか」が消えて、次セッションが同じ議論を繰り返す
- **L3 だけ**: 「どこまで進んだか」は分かるが、次に何をやるべきかの優先順位が見えない

## 公式 checkpointing との違い

| | 公式 checkpointing | Rule 24 handoff |
|---|---|---|
| スコープ | **同一セッション内** | **次セッションへ** |
| 用途 | ファイル差分の rewind | 作業の引き継ぎ |
| 形式 | 自動 (Claude Code が管理) | 手動 (init prompt + coding prompt で書かせる) |
| 読み手 | Claude (rewind 操作) | Claude + 人間 (両方) |

両者は直交する。手動 handoff レイヤを作っても checkpointing は併用できる。

## サンプル構成

```
rule24/
├── README.md
├── antipattern/
│   ├── no-handoff-prompt.md         # 「前回どこまで?」と毎回聞き直す失敗例
│   └── progress-in-comments-only.md # 進捗を CLAUDE.md にしか書かない失敗例
└── fixed/
    ├── claude-progress.txt.example  # L1 ナラティブ層 (3 ブロック構成)
    ├── feature-list.json.example    # L3 構造化進捗層
    ├── git-log-example.txt          # L2 状態層 (commit 粒度の見本)
    └── coding-prompt.md             # 3 ファイルを read する起動プロンプト
```

## 関連 Rule

- Rule 06-07: CLAUDE.md 200 行ルール。**handoff レイヤは CLAUDE.md とは別物**
- Rule 22: 単一セッション内の context 圧迫対応 (`/clear` 系)
- Rule 23: 二段「ハーネス」全体構造。Rule 24 はその中の永続化をディープダイブ
- Rule 25-26: subagent 分割は handoff があってこそ safer になる
