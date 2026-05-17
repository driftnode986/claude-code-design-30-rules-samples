# 修正後: ファイルツリー + agent がコードを書いて呼び出す

## アーキテクチャ

MCP server を「コード API」として presented する。agent はファイルシステムを探索して必要な tool 定義だけを on-demand に読む。

```
servers
├── google-drive
│   ├── getDocument.ts
│   ├── ... (other tools)
│   └── index.ts
├── salesforce
│   ├── updateRecord.ts
│   ├── ... (other tools)
│   └── index.ts
└── ... (other servers)
```

各 tool は 1 ファイルに対応する。`servers/google-drive/getDocument.ts` を参照。

## agent が書く実コード

`fixed/agent-code.ts` を参照。Google Drive 取得 → Salesforce 更新を 5 行で記述する。

```typescript
import * as gdrive from './servers/google-drive';
import * as salesforce from './servers/salesforce';

const transcript = (await gdrive.getDocument({ documentId: 'abc123' })).content;
await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});
```

## トークン消費の比較

- **upfront tool definitions**: 0 トークン (agent が必要時に `ls ./servers/` + `cat getDocument.ts` で読む)
- **agent が読む tool 定義**: 約 1,000-1,500 トークン (getDocument + updateRecord の 2 ファイル)
- **中間結果 (transcript)**: 0 トークン (execution environment 内で変数として保持、model context に流れない)
- **合計**: 約 2,000 トークン

direct tool call の 150,000 トークン → 2,000 トークン = **98.7% 削減**

## 追加の便益

- **Progressive disclosure**: `search_tools` tool + detail level (name only / name+description / full schema) で更に効率化可能
- **Context efficient tool results**: 10,000 行のスプレッドシートを execution environment 内で filter、model context には 5 行だけ流す
- **Powerful control flow**: loop/conditional をコード化、agent loop の往復を削減
- **Privacy-preserving**: PII を MCP client で tokenize、model に直接流さない
- **State persistence**: filesystem 経由で実行間の状態保持
- **Skills 接続**: agent が書いたコードを再利用可能関数として保存 → 次回以降は呼び出すだけ
