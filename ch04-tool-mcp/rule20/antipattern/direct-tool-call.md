# アンチパターン: 全 MCP tool 定義を upfront load + 中間結果が context を通過する

## Tool 定義の context 占有

MCP クライアントは接続時に全 tool 定義を context window にロードする。

```
gdrive.getDocument
     Description: Retrieves a document from Google Drive
     Parameters:
                documentId (required, string): The ID of the document to retrieve
                fields (optional, string): Specific fields to return
     Returns: Document object with title, body content, metadata, permissions, etc.

salesforce.updateRecord
    Description: Updates a record in Salesforce
    Parameters:
               objectType (required, string): Type of Salesforce object
               recordId (required, string): The ID of the record to update
               data (required, object): Fields to update with their new values
     Returns: Updated record object with confirmation

... (数千ツール続く)
```

数千 tool 接続時の累積:
- gdrive: 数十 tools × 各 200-500 トークン = 1 万トークン
- salesforce: 数百 tools × 各 200-500 トークン = 5-10 万トークン
- 他の MCP server を 10 台 = さらに 5-10 万トークン
- **合計: 約 150,000 トークン (Anthropic 実測値)**

これらすべてが request 1 件目を読む前に context にロードされる。

## 中間結果の context 通過

「Google Drive から議事録を取得して Salesforce の lead に添付」というワークフローを direct tool call で書くと:

```
TOOL CALL: gdrive.getDocument(documentId: "abc123")
        → returns "Discussed Q4 goals...\n[full transcript text]"
           (loaded into model context)

TOOL CALL: salesforce.updateRecord(
            objectType: "SalesMeeting",
            recordId: "00Q5f000001abcXYZ",
            data: { "Notes": "Discussed Q4 goals...\n[full transcript text written out]" }
        )
        (model needs to write entire transcript into context again)
```

問題点:
- transcript 全文が agent loop を 2 回通過する (gdrive 取得 → model context → salesforce 書き込み)
- 2 時間の sales meeting transcript なら +50,000 トークン
- larger documents may exceed context window limits, breaking the workflow
- 大きいデータでコピーミスのリスク (model が transcript を書き写す際の改変)

合計トークン消費: **約 150,000 トークン (tool 定義) + 中間結果分**
