# セキュリティ チェックリスト

> このファイルは CLAUDE.md から @rules/security-checklist.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される。**

## 認証

- パスワードは bcrypt (cost factor 12 以上) でハッシュ化
- ログイン試行回数制限 (5 回失敗で 15 分ロック)
- 2FA を全管理者に強制
- セッションは HttpOnly + Secure + SameSite=Lax の Cookie で管理
- JWT は RS256 (HS256 は禁止)
- リフレッシュトークンの rotation 必須

## 認可

- 全エンドポイントで明示的に権限チェック (`req.ability.can('action', 'resource')`)
- リソース所有者チェックを忘れない (例: `post.userId === req.user.id`)
- ロール変更は管理者操作 + 監査ログ
- 権限昇格 (privilege escalation) を防ぐため、ロール変更時は再認証要求

## 入力検証

- 全入力を Zod で検証
- SQL インジェクション対策: Prisma のクエリビルダーを使用 (生 SQL 禁止)
- NoSQL インジェクション対策: ユーザー入力をクエリオブジェクトとして渡さない
- XSS 対策: React の自動エスケープを信頼、`dangerouslySetInnerHTML` は禁止 (使う場合は DOMPurify で sanitize)
- CSRF 対策: SameSite Cookie + CSRF トークン (state-changing operations)

## ファイルアップロード

- MIME type 検証 (Content-Type ヘッダーだけでなくマジックナンバーも確認)
- ファイルサイズ上限 (10MB)
- 保存先は S3 (実行不可能なバケットに)
- ファイル名は UUID で再採番 (元のファイル名は信用しない)

## 機密情報の取り扱い

- 環境変数で管理 (commit しない)
- `.env` を `.gitignore` に追加
- ログに個人情報・パスワード・トークンを出力しない
- エラーメッセージにスタックトレースを含めない (本番)
- DB のパスワードカラムはアプリ層で意識的に除外 (`select: { password: false }`)

## 暗号化

- 通信は HTTPS 必須 (HSTS ヘッダー設定)
- 機密データ (クレジットカード番号等) は保存しない (Stripe 等の決済代行に委譲)
- 必要な場合は AES-256-GCM で暗号化 + 鍵は AWS KMS で管理

## 依存パッケージ

- `npm audit` を CI で実行 (high/critical で fail)
- Dependabot を有効化 (自動 PR)
- 直接依存だけでなく transitive dependency も監視
- 信用できないパッケージは使わない (新しいパッケージは事前にレビュー)

## レート制限

- 認証エンドポイント: 5 req/min/IP
- 一般 API: 30 req/min/IP (認証なし) / 300 req/min/user (認証あり)
- パスワードリセット: 3 req/hour/email
- 制限超過は 429 + Retry-After ヘッダー

## ヘッダー

- `Content-Security-Policy`: 厳格 (script-src 'self' のみ)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (iframe 埋め込み禁止)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

## ログ・監査

- 認証成功・失敗を構造化ログに記録
- 権限変更・データ削除は監査ログに記録 (別 DB)
- 監査ログは改ざん検知 (hash chain)
- 90 日間保管

## インシデント対応

- 漏洩疑い: 1 時間以内に security-team に連絡
- 確定: 24 時間以内にユーザー通知 (法令準拠)
- ポストモーテム: 1 週間以内に公開
- 全 contributor のトークン rotation (秘密漏洩時)

## 定期レビュー

- 四半期ごとに依存パッケージ更新レビュー
- 半年ごとに権限設計レビュー
- 1 年ごとに外部ペンテスト
