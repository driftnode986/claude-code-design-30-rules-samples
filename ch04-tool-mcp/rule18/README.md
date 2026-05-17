# Rule 18: Tool には namespace prefix を付けよ

本 Rule のサンプル: 「カスタマーサポート + マーケティング + 営業の三部署で別 MCP サーバーを使う組織」を題材に、汎用名衝突するアンチパターンと、サービス別 prefix + リソース別二段構成で名前空間を切るパターンの対比を示す。

## 構成

- `antipattern/mcp-tools.md`: `search` `read` `write` `update` の汎用名で命名された自作 MCP ツール群 3 セット (CRM / メール / ナレッジ DB)。Claude Code に同時接続すると同名衝突が起き、エージェントは「どの `search` を呼ぶべきか」を Tool description のみで判別しなければならない
- `fixed/mcp-tools.md`: サービス別 prefix (`crm_*` `mail_*` `kb_*`) + 多リソースのサーバーではリソース別 prefix (`crm_accounts_search` `crm_contacts_search`) で二段構成にリファクタリング
- `fixed/permissions.json`: Claude Code 側の許可設定 (本来は `settings.json` の `permissions` セクションに置く内容を、サンプル可読性のため切り出した独立ファイル)。`mcp__server__tool` の自動 prefix と、開発者命名の prefix の両方を活用した粒度制御例

## 公式根拠

- Anthropic Engineering Blog「Writing effective tools for agents — with agents」(2025-09-11)
  - "Your AI agents will potentially gain access to dozens of MCP servers and hundreds of different tools"
  - "Namespacing (grouping related tools under common prefixes) can help delineate boundaries between lots of tools"
  - "namespacing tools by service (e.g., `asana_search`, `jira_search`) and by resource (e.g., `asana_projects_search`, `asana_users_search`)"
  - "selecting between prefix- and suffix-based namespacing to have non-trivial effects on our tool-use evaluations"
  - URL: https://www.anthropic.com/engineering/writing-tools-for-agents

- Claude Code 公式ドキュメント (hooks.md, MCP ツールをマッチ セクション)
  - "MCP ツールは `mcp__<server>__<tool>` という命名パターンに従います"
  - `mcp__memory__.*` でサーバー単位のフック制御
  - URL: https://code.claude.com/docs/ja/hooks

- Claude Code 公式ドキュメント (permissions.md)
  - "`mcp__puppeteer__*` ワイルドカード構文は、puppeteer サーバーからのすべてのツールもマッチさせます"
  - URL: https://code.claude.com/docs/ja/permissions

## 設計判断

- namespace は「同名衝突回避」+ 「目的境界の明示」+ 「Hook/permissions の粒度制御」の三役
- Claude Code は MCP ツールを自動的に `mcp__<server>__<tool>` の二段 prefix に正規化するが、サーバー側のツール名が `search` のように汎用だと、Tool description だけで区別する負荷がエージェントに残る
- Anthropic 内部 eval では prefix vs suffix の選択が tool-use 精度に non-trivial effects を与えると判明。Claude では prefix が安定 (Anthropic 自身の例も `asana_search` の前置式)
- 単一サービスで複数リソースを扱う場合はサービス + リソースの二段構成 (`asana_projects_search` `asana_users_search`) でさらに境界を明示する
- 自作 Tool 命名の場合、Tool が単独で動くなら `crm_search` のような一段 prefix で十分。組織内で他サーバーと併用する見込みがあるなら最初から二段にする
