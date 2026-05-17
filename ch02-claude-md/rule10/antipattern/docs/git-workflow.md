# Git ワークフロー

> このファイルは CLAUDE.md から @docs/git-workflow.md として参照される。
> **起動時に CLAUDE.md と一緒に展開される。**

## ブランチ命名規則

- `feature/<jira-ticket>-<short-description>` (例: `feature/PROJ-123-add-user-search`)
- `fix/<jira-ticket>-<short-description>` (例: `fix/PROJ-456-login-redirect-loop`)
- `chore/<short-description>` (Jira チケットなしの雑務、例: `chore/update-deps`)
- `hotfix/<short-description>` (本番障害対応)

## コミットメッセージ

Conventional Commits に準拠:

- `feat: add user search endpoint`
- `fix: handle empty cart in checkout`
- `chore: bump next.js to 15.2.0`
- `refactor: extract auth middleware`
- `test: add e2e for password reset`
- `docs: update API readme`

タイトルは 50 文字以内、本文は 72 文字で改行。

## PR 作成

- タイトルは Jira チケット ID + 概要 (例: `[PROJ-123] Add user search endpoint`)
- 説明欄は以下のテンプレートを使用:

```markdown
## 何を
- 何を変更したか

## なぜ
- なぜ変更したか (Jira チケットへのリンク)

## どうやって
- 主要な実装方針

## 動作確認
- [ ] ローカルで単体テスト通過
- [ ] ローカルで e2e テスト通過
- [ ] ステージング環境で手動確認

## スクリーンショット
(UI 変更がある場合のみ)
```

## レビュー

- 最低 1 名の承認が必要
- フロントエンド変更は frontend-team から 1 名
- バックエンド変更は backend-team から 1 名
- DB スキーマ変更は db-team から追加 1 名
- セキュリティ関連 (認証/認可/暗号化) は security-team から追加 1 名

## マージ

- squash merge のみ (history を線形に保つ)
- マージコミットメッセージは PR タイトルと同じ
- マージ後、feature ブランチは自動削除 (GitHub 設定)

## リリース

- main ブランチへのマージ = ステージング自動デプロイ
- リリースタグは `v<semver>` 形式 (例: `v1.2.3`)
- リリースノートは GitHub Releases で自動生成 + 手動編集
- 本番デプロイはタグプッシュ後、手動承認

## hotfix

- main から直接 `hotfix/<description>` ブランチを切る
- 修正後、main と develop の両方にマージ
- 緊急時は最低 1 名のオンコール承認で本番デプロイ可

## rebase ポリシー

- feature ブランチは PR 出す前に main を rebase 推奨 (force push 可)
- main ブランチへの force push は禁止
- マージ済み PR への push は禁止 (revert PR で対応)

## 大規模変更

- 1 PR は 500 行以内を目安
- 超える場合は事前に設計レビュー (RFC ドキュメント)
- DB スキーマ変更は migration とアプリ変更を別 PR に分ける

## バイナリ・大きなファイル

- 画像・動画は Git LFS で管理
- ビルド成果物は commit 禁止 (`.gitignore` に追加)
- `.env` や秘密鍵は絶対に commit しない
- 誤って commit した場合は git filter-repo で履歴ごと削除 + 全 contributor に rotate を依頼
