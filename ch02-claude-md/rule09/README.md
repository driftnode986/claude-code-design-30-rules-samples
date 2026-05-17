# Rule 09: 矛盾する指示を書くな

書籍『Claude Code 設計の30の鉄則』 Rule 09 のサンプルです。

## ファイル

- `antipattern/CLAUDE.md` (root) + `antipattern/packages/billing/CLAUDE.md`:
  ルートと子で同じトピック (パッケージマネージャ / import スタイル
  / main 直接 push / レビュー要件) について真っ向から矛盾する例
- `fixed/CLAUDE.md` (root): 「全サービス共通の絶対規約」と
  「サービス側で決めてよい事項」を分離した版
- `fixed/packages/billing/CLAUDE.md`: ルートを継承し、billing 固有の
  規約のみを書いた版
- `fixed/.claude/settings.json`: `claudeMdExcludes` で legacy/experiments
  配下の旧 CLAUDE.md を除外する設定例
- `fixed/CONSISTENCY_AUDIT.md`: 矛盾検出のための監査チェックリストと
  記録テンプレ

## 公式の根拠

公式ドキュメント「メモリ」(`memory.md`):

> 一貫性: 2 つのルールが互いに矛盾している場合、Claude は 1 つを
> 任意に選択する可能性があります。

> 発見されたすべてのファイルはコンテキストに連結され、互いに上書き
> するのではなく、ディレクトリツリー全体で、コンテンツはファイル
> システムルートからワーキングディレクトリまで順序付けられます。

つまりルートと子の CLAUDE.md は「連結」される。「子で上書きされる」
わけではない。両方が同時にコンテキストに入る。

## 検出方法

1. **定期レビュー** (本リポジトリの `CONSISTENCY_AUDIT.md` 参照)
2. **`/memory` コマンド**: 現在ロード中の CLAUDE.md・rules を一覧
3. **InstructionsLoaded hook**: どのファイルがいつ読み込まれたかを
   ログ出力 (公式 `memory.md` トラブルシューティング推奨)
4. **症状観察**: 「Claude が以前と違う挙動をする」「同じプロンプト
   で結果が安定しない」が観測されたら矛盾を疑う

## 検証バージョン

Claude Code CLI v2.x

## 関連

- Rule 06: CLAUDE.md は 200 行以内に保て (長くなるほど矛盾混入確率↑)
- Rule 07: 削除自問テストでプルーニングする (矛盾解消と同じ規律)
- Rule 10: @import は起動時コンテキストを減らさない
  (@import で「分割した気になる」と矛盾が見えなくなる)
- Rule 14: Hook で絶対実行を書け (ハード制約は hook で矛盾の余地を消す)
