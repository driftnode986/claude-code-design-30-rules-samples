# Rule 04: 最も単純な解から始めよ

## このサンプルで何を見せるか

Anthropic Engineering Blog "Building effective agents" (2024-12-19) は、agentic system を組む大原則として次を最初に置いている:

> When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance, and you should consider when this tradeoff makes sense.

「最も単純な解から始め、必要なときだけ複雑性を増やせ。場合によっては agentic system をまったく組まない選択も含まれる」。Claude Code でも、Skill / Subagent / Hook / MCP / Multi-agent を積む前に、`claude` 単独 + Bash + 短い CLAUDE.md で済まないかを問う。本 Rule のサンプルは、同じ要件 (PDF を要約する) に対して「最初から全部足した」アンチパターンと「1 行で済ませた」修正後の対比を示す。

このディレクトリには次の 2 ファイルを置く:

- `antipattern/CLAUDE.md` — Multi-agent + Skill + Hook + MCP を最初から積んだ重い CLAUDE.md (1 件目の処理が始まる前に半日が経つ)
- `fixed/CLAUDE.md` — `@paper.pdf` の 1 行プロンプトで動かす最小構成 + 拡張する場合の判断軸を明記

## 「複雑性を足す前に問うべき 3 つの問い」

本書 Rule 04 は、Anthropic 公式の三原則 (Simplicity / Transparency / ACI design) を Claude Code の拡張点と直接マッピングし、複雑性を足す判断軸を 3 つの問いとして整理する:

1. **demonstrable improvement があるか?** — 評価セットや実測で改善が測れるか
2. **同じ単純解では応えられない新しい制約が出たか?** — レイテンシ目標・並列処理・セキュリティ境界・コンテキスト分離
3. **代償 (コスト・複雑度・デバッグ難度) を引き受けられるか?** — 個人開発か本番運用か

3 つすべてに「はい」と答えられたときだけ、1 段階だけ複雑性を足す。一度に 2 段階以上足さない。

## 期待される効果

- 「Skill が呼ばれない」「Subagent が起動しない」型の相談の発生を減らす
- Multi-agent のトークンコスト (本書 Rule 25 で扱う 15 倍) を不要な場面で支払わない
- デバッグ時にレイヤの責任分離ができ、原因追跡が早くなる

## 関連 Rule

- Rule 01「コンテキストを有限の予算として扱う」 — コンテキスト視点での単純化
- Rule 03「Workflow か Agent か — 二項対立で考える」 — 単純化判断の最初のフォーク
- Rule 11「3 軸 (コンテキスト分離 / 副作用 / 再利用) で選ぶ」 — 「足す」と決めた後に何を足すか
- Rule 17「人間でも判別できないなら AI も判別できない」 — ACI 原則の具体化
- Rule 25「Multi-agent は通常チャットの 15 倍トークンを消費する」 — 複雑性のコストの数値裏付け

## 参考文献

- Anthropic Engineering Blog "Building effective agents" (2024-12-19). https://www.anthropic.com/engineering/building-effective-agents
