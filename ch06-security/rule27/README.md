# Rule 27: Filesystem 分離 + Network 分離の両方が必要

Anthropic Engineering Blog "Beyond permission prompts" (2025-10-20) は、Claude Code のサンドボックスを次のように定義する。

> It is worth noting that effective sandboxing requires *both* filesystem and network isolation. Without network isolation, a compromised agent could exfiltrate sensitive files like SSH keys; without filesystem isolation, a compromised agent could easily escape the sandbox and gain network access.

Filesystem 分離 (作業ディレクトリ外への書き込みを OS レベルで遮断) と Network 分離 (proxy 経由のドメイン制限) は片方だけでは破られる。両方そろえて初めて「侵害された Claude Code が SSH キーを抜き出せない / 攻撃者のサーバーへコールバックできない」状態になる。

社内利用ではこの設定でパーミッションプロンプトが 84% 削減された。安全性と自律性を同時に得られる稀な設計。

## ファイル

- `antipattern/settings-filesystem-only.json` — Filesystem 分離のみ (allowedDomains 未指定 → デフォルト全許可で Network 分離破綻)
- `antipattern/settings-network-only.json` — Network 分離のみ (allowWrite に `~/` を含めるなど Filesystem 分離破綻)
- `fixed/settings-both-isolated.json` — 両方分離 + escape hatch 閉鎖 + 狭域 allowlist
- `fixed/README-operations.md` — 運用ノート (Linux 弱体化 nested sandbox / domain fronting / dangerouslyDisableSandbox の扱い)
