# Rule 21: ResponseFormat enum で detailed/concise を切り替えろ

> Anthropic Engineering Blog "Writing effective tools for agents — with agents"
> (2025-09-11) L168-195 が主柱。

## サンプル構成

```
rule21/
├── README.md                         # 本ファイル
├── antipattern/
│   └── search_user.ts                # 常に detailed を返す Tool (206 tokens 想定)
└── fixed/
    ├── search_user.ts                # response_format enum で concise/detailed 切替
    ├── search_user_extended.ts       # 5 段階 + GraphQL 風 fields パラメータ
    └── error_response.ts             # truncation 時の steering + error response 例
```

## 検証数値 (Anthropic 実測)

| 形式 | トークン数 | 削減率 |
|------|-----------|--------|
| Detailed | 206 tokens | (基準) |
| Concise | 72 tokens | **65.0% 削減** |

ソース: Writing effective tools for agents L179, L183

Claude Code のデフォルト Tool response 上限: **25,000 tokens** (L193)

## 検証

- TypeScript: 構文有効 (tsc --noEmit でチェック想定)
- Tool schema: Anthropic Tool Use API 仕様準拠
- enum 値: 記事 L172-177 の `enum ResponseFormat { DETAILED, CONCISE }` 完全一致
