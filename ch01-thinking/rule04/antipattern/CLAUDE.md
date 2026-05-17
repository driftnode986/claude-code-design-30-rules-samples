# PDF 要約システム CLAUDE.md

このプロジェクトは PDF ファイルを処理して要約を生成するシステムです。

## アーキテクチャ

PDF 抽出専門の Subagent、要約専門の Subagent、品質チェック専門の
Subagent を協調させて動作します。MCP サーバーで PDF 処理ライブラリを
公開し、Skill で PDF 操作の手順を Progressive Disclosure で提供します。

## Subagents

### pdf-extractor (.claude/agents/pdf-extractor.md)

- 担当: PDF からテキストを抽出
- 使用ツール: Read, Bash (pdftotext, pdfinfo, qpdf)
- model: opus
- 別コンテキストで動作

### summarizer (.claude/agents/summarizer.md)

- 担当: 抽出されたテキストから要約を生成
- 使用ツール: なし (テキスト処理のみ)
- model: opus
- 出力フォーマット: Markdown 階層構造

### quality-checker (.claude/agents/quality-checker.md)

- 担当: 要約の品質をチェックして再生成を判断
- 使用ツール: Read
- model: sonnet
- 評価軸: 網羅性、要約率、専門用語の保存

## Skills

### .claude/skills/pdf-toolkit/SKILL.md

PDF 操作の手順書を Progressive Disclosure で提供します。

- フロントマター: PDF 操作全般の概要 (常時ロード)
- examples/extract-tables.md: 表抽出の手順 (オンデマンド)
- examples/extract-images.md: 画像抽出の手順 (オンデマンド)
- examples/redact-pii.md: 個人情報マスクの手順 (オンデマンド)

## MCP

### mcp-servers/pdf-server

社内で開発した MCP サーバーを使用します。pdftotext、pdfinfo、qpdf、
pdfimages、Tesseract OCR を公開しています。tools.json には 15 個の
ツールが定義されています。

## Hooks

### .claude/hooks/PreToolUse-block-non-pdf.sh

PDF 以外のファイル操作をブロックします。Read / Write / Edit ツールが
.pdf 以外を対象にした場合、即座にブロックして再プロンプトを促します。

### .claude/hooks/PostToolUse-validate-summary.sh

要約生成後、自動的に品質チェック Subagent を起動します。
