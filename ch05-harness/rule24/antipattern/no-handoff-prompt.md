# アンチパターン: 「前回どこまで?」を毎回ユーザーに聞く起動プロンプト

## CLAUDE.md (この書き方が問題)

```markdown
# プロジェクト: claude.ai clone

## あなたの役割

このプロジェクトを開発するエージェントです。
何かわからないことがあれば、いつでもユーザーに聞いてください。

## 起動時の挙動

ユーザーから指示が来たら、それに従ってください。
前回のセッション内容が不明な場合は、ユーザーに状況を確認してください。
```

## 何が起こるか (5 回目のセッションの実況)

```
[User] こんにちは。今日は続きから作業をお願いします。
[Assistant] こんにちは。前回のセッションでどこまで作業されましたか?
            何の機能を実装中だったか教えてください。
[User] (ため息) チャット履歴を見てくれ……。
       sidebar の conversation 切り替えと、メッセージ送信の loading state は
       終わってる。次は theme switch だったはず。
[Assistant] わかりました。それでは theme switch の実装から始めます。
            現在の theme 関連のコードはどこにありますか?
[User] (もう一度ため息) src/ を見れば分かるだろ……。
```

## なぜ失敗するのか

1. **fresh context window**: 新しい session には前回の作業履歴がコンテキスト
   として存在しない (Anthropic Engineering Blog "Building a C compiler" L79
   "agent is dropped into a fresh container with no context")
2. **オーラルヒストリー前提**: ユーザーが毎回状況を口頭で説明することを暗黙の
   前提にしている。これは scaling しない (5 回目で破綻する)
3. **記憶レイヤの不在**: `claude-progress.txt` / `git log` / `feature_list.json`
   といった永続化レイヤがプロジェクトに存在しないため、agent が自力で orient
   できない

## 修正方針

`fixed/coding-prompt.md` の起動シーケンスに置き換える。
セッション冒頭で agent が **自動的に 3 ファイルを read して状況を復元する**
ことを CLAUDE.md / system prompt レベルで明示する。
