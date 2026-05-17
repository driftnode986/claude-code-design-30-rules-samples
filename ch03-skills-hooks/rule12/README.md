# Rule 12: Skill は使うときだけ読まれる

本 Rule のサンプル: CLAUDE.md にすべての手順を詰め込んだアンチパターンと、Skill に切り出した修正後。Progressive Disclosure と読み込みコスト二段予算（description 1,536 字 + 動的予算 8K フォールバック / コンパクション後 5K + 25K）の物理挙動を反映。

## 構成

- `antipattern/CLAUDE.md`: 全手順を inline で詰め込んだ 350+ 行の CLAUDE.md（毎セッション起動で全文ロード）
- `fixed/CLAUDE.md`: プロジェクト固有の不変事実 60 行のみ
- `fixed/.claude/skills/deploy/SKILL.md`: タスク型 Skill (`disable-model-invocation: true`)
- `fixed/.claude/skills/api-conventions/SKILL.md`: リファレンス型 Skill
- `fixed/.claude/skills/api-conventions/reference.md`: SKILL.md から切り出した長い参考資料（呼び出し時にも自動展開されない、SKILL.md 内の参照を Claude が必要時に Read する）
- `fixed/.claude/skills/sql-style/SKILL.md`: リファレンス型 Skill (SQL スタイルガイド)

## 公式根拠

- Claude Code 公式「スキルで Claude を拡張する」: https://code.claude.com/docs/ja/skills
  - 「CLAUDE.md コンテンツとは異なり、スキルの本体は使用されるときにのみ読み込まれる」
  - 「description と when_to_use の組み合わせテキストは 1,536 文字で短縮されます」
  - 「予算はコンテキストウィンドウの 1% で動的にスケーリングされ、8,000 文字のフォールバックがあります」
  - 「Claude Code は各スキルの最新の呼び出しを要約の後に再度アタッチし、最初の 5,000 トークンを保持します。再度アタッチされたスキルは 25,000 トークンの合計予算を共有します」
  - 「SKILL.md を 500 行以下に保ちます」
- Anthropic Engineering Blog "Effective context engineering for AI agents" (2025-09-29): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
  - "just in time" approach / progressive disclosure
