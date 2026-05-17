# アンチパターン: 汎用名で命名された自作 MCP ツール群

組織で 3 つの自作 MCP サーバーを並行運用しているケース。各チームが独自に Tool を命名した結果、`search` `read` `write` `update` という汎用名が衝突している。

## crm-server (営業チーム)

```yaml
name: crm-server
tools:
  - name: search
    description: 顧客情報を検索する
    inputSchema:
      type: object
      properties:
        query:
          type: string
          description: 検索クエリ
        type:
          type: string
          description: 種別 (account / contact / deal)
  - name: read
    description: ID から詳細を取得する
    inputSchema:
      type: object
      properties:
        id:
          type: string
  - name: write
    description: 新規登録または更新する
    inputSchema:
      type: object
      properties:
        type:
          type: string
        data:
          type: object
  - name: update
    description: ステータスを更新する
    inputSchema:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
```

## mail-server (マーケティングチーム)

```yaml
name: mail-server
tools:
  - name: search
    description: メール本文・件名を検索する
    inputSchema:
      type: object
      properties:
        query:
          type: string
        folder:
          type: string
  - name: read
    description: メール ID から本文を取得する
    inputSchema:
      type: object
      properties:
        id:
          type: string
  - name: write
    description: 下書きを作成する
    inputSchema:
      type: object
      properties:
        to:
          type: string
        subject:
          type: string
        body:
          type: string
  - name: update
    description: メールの状態を変更する
    inputSchema:
      type: object
      properties:
        id:
          type: string
        flag:
          type: string
```

## kb-server (サポートチーム、ナレッジ DB)

```yaml
name: kb-server
tools:
  - name: search
    description: 記事を検索する
    inputSchema:
      type: object
      properties:
        query:
          type: string
        category:
          type: string
  - name: read
    description: 記事 ID から本文を取得する
    inputSchema:
      type: object
      properties:
        id:
          type: string
  - name: write
    description: 記事を新規作成する
    inputSchema:
      type: object
      properties:
        title:
          type: string
        body:
          type: string
        tags:
          type: array
  - name: update
    description: 記事を更新する
    inputSchema:
      type: object
      properties:
        id:
          type: string
        body:
          type: string
```

## 何が起きるか

Claude Code は MCP プロトコル経由で接続したツールを自動的に `mcp__<server>__<tool>` 形式に正規化するため、技術的には衝突しない。それでも問題は残る。

1. **Tool 一覧が判別困難**: Claude の context にロードされる Tool 定義は `mcp__crm-server__search` `mcp__mail-server__search` `mcp__kb-server__search` の 3 つが並ぶ。description (「顧客情報を検索する」「メール本文・件名を検索する」「記事を検索する」) を 1 行ずつ読まないと区別できない。
2. **エージェントの選択コスト**: 「顧客名を含む過去のメール対応履歴を探してくれ」というユーザー指示に対し、Claude は `mcp__crm-server__search` か `mcp__mail-server__search` のどちらを呼ぶか迷う。Tool description が短ければ短いほど取り違えやすい。
3. **Hook の粒度制御がぎこちない**: `PreToolUse` で「すべての書き込み系操作を監視する」hook を書く場合、`mcp__crm-server__write` `mcp__mail-server__write` `mcp__kb-server__write` を個別に列挙するか、`mcp__.*__write` のような正規表現で複数サーバーを横断的に拾うことになる。後者はサーバー名にタイポがあっても気付きにくい。
4. **`settings.json` の `permissions` の保守性**: 「営業チームには CRM の書き込みだけ許す」「マーケには CRM の読み込みだけ許す」という粒度の許可を書く際、`mcp__crm-server__write` `mcp__crm-server__update` を個別列挙する必要がある。Tool 数が増えると爆発する。
5. **Tool description の冗長化**: 衝突回避のために、description に「(営業チーム CRM 専用)」「(マーケ専用)」のような所属情報を毎回書き加える慣行が発生する。Tool 名で表現すべき情報が description に逃げている。
