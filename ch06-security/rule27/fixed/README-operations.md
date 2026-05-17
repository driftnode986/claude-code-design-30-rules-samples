# Rule 27 修正後設定の運用ノート

`fixed/settings-both-isolated.json` の各キーが何を防ぐかを整理する。

## allowUnsandboxedCommands: false

公式 docs `sandboxing.md` L200-204 によると、Claude Code には `dangerouslyDisableSandbox` パラメータで sandbox を回避する escape hatch がある。Claude が sandbox 制約でコマンド失敗を検出すると、このパラメータ付きで retry を提案する。

これを完全に閉じるのが `allowUnsandboxedCommands: false`。managed deployments (組織レベルで sandbox を必須化) で使う。`true` のままだと、Claude が「失敗したのでこのコマンドだけ sandbox 外で」と提案 → ユーザーが疲れていると承認 → sandbox の意味が消失するリスクがある。

## failIfUnavailable: true

bubblewrap / Seatbelt が見つからない / 起動できない時にどう振る舞うか。デフォルトは「警告を出して sandbox なしで継続」、`true` にすると「ハード失敗で起動拒否」。本番マシンでは `true` にして「sandbox がない環境では Claude Code を起動させない」運用にする。

## filesystem.denyRead で SSH/credentials を完全遮断

`denyRead: ["~/.ssh", "~/.aws", "~/.config/gcloud"]` で SSH キー、AWS credential、GCP credential を OS レベルで読めなくする。これは Read tool だけでなく `cat ~/.ssh/id_rsa` のような bash 経由のアクセスも遮断される (OS-level enforcement、`sandboxing.md` L42)。

`allowRead: ["./"]` を併記して、プロジェクト内は読める状態に再開放する。

## network.allowManagedDomainsOnly: true

非管理者ドメインの自動ブロック。デフォルトは「新しいドメインを要求されたらユーザー確認」だが、これは approval fatigue を生む。`true` にすると **管理者が定義したドメインのみ**通信可能。CI/CD やセキュリティ重視環境向け。

## github.com を deniedDomains に入れる理由

公式 docs `sandboxing.md` L255-256 が明示的に警告している。

> Allowing broad domains such as `github.com` can create paths for data exfiltration. Because the proxy makes its allow decision from the client-supplied hostname without inspecting TLS, code running inside the sandbox can potentially use domain fronting or similar techniques to reach hosts outside the allowlist.

built-in proxy は TLS を inspect しない (client-supplied hostname だけで判定) ため、`github.com` を許可すると **domain fronting で他のホストに到達できる**。`api.github.com` だけ許可して `github.com` を deny する設計で、攻撃面を狭める。

TLS 検査が必要な組織は custom proxy を立てて、その CA cert を sandbox に install する (`sandboxing.md` L256)。

## 言及しない選択肢

- `enableWeakerNestedSandbox`: Linux で Docker 内に sandbox を入れたい場合に使うが、`sandboxing.md` L261「This option considerably weakens security」と公式が明示。Docker-in-Docker 環境では別の隔離 (VM 単位) を併用する前提でのみ採用。
- `allowUnixSockets`: `/var/run/docker.sock` を許可すると docker 経由でホスト全権限が取れる (`sandboxing.md` L259)。本サンプルでは扱わない。
