# Rule 17: 人間でも判別できないなら AI も判別できない

本 Rule のサンプル: 「カスタマーサポート対応のエージェント」を題材に、暗号的・曖昧なツール命名と、人間 (新人エンジニア) にも一目で意図が分かる命名の対比を示す。

## 構成

- `antipattern/.claude/agents/data-agent.md`: 暗号的なツール名 (`get_data`, `process_record`) + 曖昧なパラメータ名 (`id`, `type`, `data`, `mode`, `user`) を持つ Subagent。新人エンジニアが見て「何のデータ?」「何を処理?」「id は何の id?」と質問する必要がある
- `fixed/.claude/agents/data-agent.md`: 自然言語識別子 + 明確なパラメータ命名 (`customer_id`, `note_text`, `email`) + 役割を反映した description にリファクタリングした Subagent。新人エンジニアが description を読んで一度で理解できる

## 公式根拠

- Anthropic Engineering Blog「Writing effective tools for agents — with agents」(2025-09-11)
  - "the tools that are most 'ergonomic' for agents also end up being surprisingly intuitive to grasp as humans"
  - "think of how you would describe your tool to a new hire on your team"
  - "input parameters should be unambiguously named: instead of a parameter named `user`, try a parameter named `user_id`"
  - "Agents also tend to grapple with natural language names, terms, or identifiers significantly more successfully than they do with cryptic identifiers"
  - "Claude Sonnet 3.5 achieved state-of-the-art performance on the SWE-bench Verified evaluation after we made precise refinements to tool descriptions"
  - URL: https://www.anthropic.com/engineering/writing-tools-for-agents

## 設計判断

- 「新人エンジニアテスト」 = ツール description / parameter 名を新人に見せて、一度で意図が伝わるかを判定する操作的テスト
- ベテランエンジニアは暗黙の文脈を補完してしまうため、判別可能性テストとして弱い (AI は補完しない or 推測実行する)
- UUID 等の暗号的識別子は意味的に解釈可能な ID スキームに変換するだけで、Claude の検索精度が向上する (writing-tools-for-agents L166)
- description は単なる「説明」ではなく、Claude の context に直接ロードされて推論材料になる → 命名と description は本質的に同じレイヤーの設計対象
