// agent が code execution environment で書くコード:
// Read transcript from Google Docs and add to Salesforce lead
import * as gdrive from './servers/google-drive';
import * as salesforce from './servers/salesforce';

const transcript = (await gdrive.getDocument({ documentId: 'abc123' })).content;

await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});

// model context に流れるのは:
// - getDocument の interface 定義 (about 500 tokens)
// - updateRecord の interface 定義 (about 500 tokens)
// - 上記コードの記述 (about 1,000 tokens)
// 合計 約 2,000 tokens
//
// transcript の中身 (50,000 tokens 相当の長文) は変数として execution
// environment に保持されるだけで、model の context には流れない。
//
// direct tool call の 150,000 tokens → 2,000 tokens = 98.7% 削減
// (Anthropic Engineering Blog "Code execution with MCP" 2025-11-04 L123)
