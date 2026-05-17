# 修正後: context 管理 4 階層エスカレーションラダー

`/context` で context 圧迫率を確認し、以下の順で対処する。
侵襲度の低い順 (失う情報量の少ない順) に並んでいる。

なお、本ラダーで示す「60-80% → レベル 0」「80-85% → レベル 1」
「85% 超 → レベル 2」という圧迫率閾値は、本書が運用ガイドとして
提案する目安である。Anthropic 公式ドキュメントは 4 手段
(`/context` / `/rewind` / `/compact` / `/clear`) の存在と
tool result clearing の軽量性を示すのみで、具体的な閾値は規定していない。
読者は自分のプロジェクトで `/context` の出力を観察しながら
閾値を調整すること。

## レベル 0: tool result clearing (最も軽い)

侵襲度: 極小
何を消すか: 過去の tool 呼び出しの結果テキスト (`tool_use_id` 単位)
何を残すか: 会話の自然言語部分、tool 呼び出しの事実、最近の tool 結果

使い分け:
- context 圧迫率 60-80% で、原因が「大量の tool 結果が古いまま残っている」場合
- Anthropic Developer Platform 側の API feature として実装されている
- Claude Code 内部での auto-compaction が裏側で利用する場合がある
- 利用者側からは「`/compact` を打たずに自然に運用を続ける」ことで
  Claude Code 側の自動 tool result clearing に任せる選択肢になる

根拠: Anthropic Engineering Blog "Effective context engineering for AI agents"
(2025-09-29) L93: "One of the safest lightest touch forms of compaction
is tool result clearing"

## レベル 1: /rewind 局所要約

侵襲度: 小
何を消すか: チェックポイント以降のメッセージのみ
何を残すか: 初期コンテキストの完全な詳細

使い分け:
- セッション後半で長い試行錯誤が発生し、その部分だけ圧縮したい場合
- `Esc + Esc` でメッセージチェックポイントピッカーを開き、
  「ここから要約」を選ぶ

根拠: `~/.claude/docs/claude-code-ja/best-practices.md` L202、checkpointing.md L31

## レベル 2: /compact 全体要約 (+ instructions)

侵襲度: 中
何を消すか: 冗長な tool outputs、繰り返しメッセージ
何を残すか: architectural decisions、unresolved bugs、
            implementation details、最新 5 ファイル

使い分け:
- context 圧迫率 85% 超で `/rewind` では足りない場合
- 必ず `instructions` を渡す:
    /compact Focus on the API design decisions
- `CLAUDE.md` に compaction の指示を書いておく

根拠: `~/.claude/docs/claude-code/commands.md` L51、best-practices.md L201-203、
Engineering Blog L89 (「最新 5 ファイルを保持」)

## レベル 3: /clear 完全リセット (最後の手段)

侵襲度: 大
何を消すか: 会話全体
何を残すか: project memory (`CLAUDE.md` + `.claude/`)、
            `/resume` で復元可能なログ

使い分け:
- 同じ問題で 2 回以上修正を繰り返した場合 (Rule 30 と直結)
- 関連のないタスクに切り替える場合

根拠: `~/.claude/docs/claude-code/commands.md` L49、best-practices.md L283
(「2 回の失敗した修正の後、`/clear` を実行」)、Rule 30 接続

## 運用フロー

1. /context で圧迫率を確認
2. 60-80% → レベル 0 (待つ、自動)
3. 80-85% → レベル 1 (/rewind 局所要約)
4. 85% 超 → レベル 2 (/compact + instructions)
5. 同じ問題で 2 回失敗 → レベル 3 (/clear + 詳細プロンプト書き直し)

各レベルでの判断基準は数値そのものよりも「失うリスクの大きさ」で決める。
subtle context (設計判断・unresolved bugs) を失うコストが高いほど、
低レベルから順に試す。
