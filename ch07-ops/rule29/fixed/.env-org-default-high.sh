#!/usr/bin/env bash
# 組織レベルで effort を固定する。
# このファイルを ~/.zprofile や /etc/profile.d/ から source する。
#
# CLAUDE_CODE_EFFORT_LEVEL は他の全ての effort 設定 (settings.json /
# frontmatter / --effort フラグ / /effort) よりも優先される。
# 組織で effort をロックしたい場合に使う唯一の確実な手段。

export CLAUDE_CODE_EFFORT_LEVEL="high"
