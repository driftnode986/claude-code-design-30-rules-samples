# 修正後: サービス別 prefix + リソース別二段構成で名前空間化

3 サーバーすべてに対し、サーバー側のツール名を能動的に prefix 付きでリネームする。Claude Code 側の自動 prefix (`mcp__server__tool`) と二重になるが、これは冗長ではなく意図的な多層防御。

## crm-server (営業チーム) — リソースが多いため二段 prefix

```yaml
name: crm-server
tools:
  - name: crm_accounts_search
    description: |
      取引先 (account) を社名・業種・規模で検索する。
      返り値: account_id, account_name, industry, employee_count
    inputSchema:
      type: object
      properties:
        query:
          type: string
          description: 検索クエリ (社名の部分一致)
        industry:
          type: string
          description: 業種フィルタ (任意)
      required: [query]
  - name: crm_accounts_read
    description: account_id から取引先の詳細を取得する
    inputSchema:
      type: object
      properties:
        account_id:
          type: string
      required: [account_id]
  - name: crm_contacts_search
    description: |
      担当者 (contact) を氏名・役職・所属取引先で検索する。
      返り値: contact_id, contact_name, title, account_id
    inputSchema:
      type: object
      properties:
        query:
          type: string
        account_id:
          type: string
          description: 取引先絞り込み (任意)
      required: [query]
  - name: crm_contacts_read
    description: contact_id から担当者の詳細を取得する
    inputSchema:
      type: object
      properties:
        contact_id:
          type: string
      required: [contact_id]
  - name: crm_deals_search
    description: 商談 (deal) をフェーズ・金額・期日で検索する
    inputSchema:
      type: object
      properties:
        phase:
          type: string
        min_amount:
          type: number
  - name: crm_deals_update_phase
    description: 商談のフェーズを更新する
    inputSchema:
      type: object
      properties:
        deal_id:
          type: string
        new_phase:
          type: string
      required: [deal_id, new_phase]
  - name: crm_notes_write
    description: 取引先または商談にメモを追加する
    inputSchema:
      type: object
      properties:
        target_type:
          type: string
          enum: [account, deal]
        target_id:
          type: string
        note_text:
          type: string
      required: [target_type, target_id, note_text]
```

## mail-server (マーケティングチーム) — サービス別 prefix のみ

```yaml
name: mail-server
tools:
  - name: mail_search
    description: |
      メール本文・件名・送受信者で検索する。
      返り値: message_id, subject, from, to, sent_at, snippet
    inputSchema:
      type: object
      properties:
        query:
          type: string
        folder:
          type: string
          enum: [inbox, sent, archive]
        from_after:
          type: string
          description: ISO 8601 日付以降に絞る (任意)
      required: [query]
  - name: mail_read
    description: message_id から本文全文を取得する
    inputSchema:
      type: object
      properties:
        message_id:
          type: string
      required: [message_id]
  - name: mail_draft_create
    description: 下書きを作成する (送信はしない)
    inputSchema:
      type: object
      properties:
        to:
          type: string
        subject:
          type: string
        body:
          type: string
      required: [to, subject, body]
  - name: mail_flag_update
    description: メールにフラグを付ける (重要/未読/既読)
    inputSchema:
      type: object
      properties:
        message_id:
          type: string
        flag:
          type: string
          enum: [important, unread, read]
      required: [message_id, flag]
```

## kb-server (サポートチーム) — サービス別 prefix のみ

```yaml
name: kb-server
tools:
  - name: kb_articles_search
    description: |
      ナレッジ記事をタイトル・本文・タグで検索する。
      返り値: article_id, title, category, tags, updated_at
    inputSchema:
      type: object
      properties:
        query:
          type: string
        category:
          type: string
          description: faq | troubleshooting | how_to のいずれか
      required: [query]
  - name: kb_articles_read
    description: article_id から記事本文を取得する
    inputSchema:
      type: object
      properties:
        article_id:
          type: string
      required: [article_id]
  - name: kb_articles_create
    description: 新規記事を作成する (公開状態は draft)
    inputSchema:
      type: object
      properties:
        title:
          type: string
        body:
          type: string
        tags:
          type: array
          items:
            type: string
      required: [title, body]
  - name: kb_articles_update_body
    description: 既存記事の本文を更新する
    inputSchema:
      type: object
      properties:
        article_id:
          type: string
        new_body:
          type: string
      required: [article_id, new_body]
```

## 何が解決するか

1. **Tool 一覧が一目で分類可能**: Claude の context にロードされる Tool 名は `mcp__crm-server__crm_accounts_search` のように、Claude Code 側自動 prefix とサーバー側 prefix が二重に付く。エージェントは prefix を見るだけで「これは CRM の取引先検索だ」と判別できる。
2. **エージェントの選択コストが減る**: 「顧客名を含む過去のメール対応履歴を探してくれ」に対し、Claude は `mcp__mail-server__mail_search` を迷わず選べる。`mail_` が付いているため誤って CRM 検索を呼ぶ確率が下がる。Anthropic 内部 eval でも、prefix の有無で tool-use 精度に non-trivial な差が出ることが確認されている (`writing-tools-for-agents` L158)。
3. **Hook の粒度制御が宣言的になる**: `mcp__crm-server__crm_.*_write|mcp__crm-server__crm_.*_create|mcp__crm-server__crm_.*_update_.*` のように、サーバー名 + リソース命名規約から書き込み系を一括で拾える。
4. **`settings.json` の `permissions` が読みやすい**: 後述の `permissions.json` (本来は settings.json 内のセクション) を参照。
5. **description が短く保てる**: Tool 名から所属とリソース型が判別できるため、description は「何をするか」だけに集中できる。
