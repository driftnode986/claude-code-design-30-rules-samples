# Rule 20: MCP は「コードで呼べ」(98.7% 削減)

本 Rule のサンプル: Google Drive から議事録を取得して Salesforce の lead に添付するワークフローを題材に、direct tool call (アンチパターン) と code execution with MCP (修正後) の対比を示す。

## 構成

- `antipattern/direct-tool-call.md`: 全 MCP tool 定義を upfront load + 中間結果が context を通過する従来パターン
- `fixed/code-execution.md`: `./servers/` ファイルツリー + agent がコードを書いて呼び出すパターン (Anthropic 推奨)
- `fixed/servers/google-drive/getDocument.ts`: tool 1 件を 1 ファイルで表現する実物例
- `fixed/servers/salesforce/updateRecord.ts`: 同上、Salesforce server の updateRecord
- `fixed/agent-code.ts`: agent が書く実コード (gdrive 取得 → salesforce 更新を 5 行で表現)

## 公式根拠

- Anthropic Engineering Blog「Code execution with MCP: Building more efficient agents」(2025-11-04)
  - "150,000 tokens to 2,000 tokens—a time and cost saving of 98.7%" (L123)
  - "Tool definitions overload the context window" (L23)
  - "Intermediate tool results consume additional tokens" (L44)
  - "agents can load only the tools they need and process data in the execution environment" (L71)
  - URL: https://www.anthropic.com/engineering/code-execution-with-mcp

- Cloudflare Blog "Code Mode" (独立同型、同種知見)
  - URL: https://blog.cloudflare.com/code-mode/

## 設計判断

- MCP は数千ツール時代のスケール問題に直面している。直接呼び出しを継続するとトークン消費が context window を圧迫する
- 解決: MCP server を「コード API」として presented し、agent にコードを書かせる
- ファイルツリー構造 (`./servers/<service>/<tool>.ts`) で **on-demand 読込** を実現 (Progressive disclosure)
- 中間結果は execution environment 内で filter/transform され、model context には summary だけが流れる
- Privacy-preserving: PII を MCP client で tokenize し、model に直接流さない
- State persistence: filesystem 経由で実行間の状態保持、agent が書いたコードを Skills として再利用
