# アンチパターン: 単一プロンプト + /clear ループ運用

長期プロジェクトを 1 種類のプロンプトで走らせる。
context が満杯になったら `/clear` で会話をリセットし、
同じプロンプトをもう一度入れて続きから作業を始める。

```
$ claude
> Build a clone of claude.ai with chat, sidebar, theme switching, and
> conversation history. Use Next.js + TypeScript + Tailwind.
[Claude works for 90 minutes, context fills up]
> /context
context: 92%
> /clear
> Build a clone of claude.ai with chat, sidebar, theme switching, and
> conversation history. Use Next.js + TypeScript + Tailwind.
[Claude starts from scratch, has no memory of what was built]
```

## 観測される失敗パターン

### パターン 1: state 喪失

`/clear` で会話を消すと、Claude は前セッションで何を作ったかを知らない。
新しい session で `ls` を打って既存ファイルを確認するが、
「なぜこのファイル構成になっているか」「次に何を実装すべきか」
は git log を見ても断片的にしか分からない。

結果として Claude は既存コードを誤って書き直したり、
すでに実装した機能を再実装したりする。

### パターン 2: 一発実装の失敗

高レベルなプロンプト「claude.ai のクローンを作って」を毎回入れると、
Claude は「全体を一気に作ろう」とする。
1 セッションで context window を使い切り、中途半端な状態で session end になる。

Anthropic Engineering Blog "Effective harnesses for long-running agents"
L19 が指摘する失敗パターンそのもの。

### パターン 3: 進捗の不可視化

「今どこまで進んでいるか」を表現するファイルが存在しないため、
ユーザーも Claude も「あと何をすれば完成か」を即答できない。
git log は「何を変更したか」を示すが、「次に何をすべきか」は示さない。

### パターン 4: E2E 検証の欠落

毎セッション開始時に「dev server を起動して E2E テストを走らせる」
ステップがないため、Claude は前セッションで壊した機能に気付かないまま
新機能を実装し、壊れている範囲を拡大していく。

## なぜこれが起きるか

- Claude Code を「対話的なコード生成ツール」としてしか見ていない
- 長期プロジェクトを「複数 context window を跨ぐ」設計問題として
  捉えていない
- Anthropic Engineering Blog (2025-11-26) で提示された二段「ハーネス」
  パターンが本書執筆時点で日本語圏に伝わっていない

## 修正方針

`fixed/initializer-prompt.md` + `fixed/coding-prompt.md` の二段運用へ。
詳細は `README.md` 参照。
