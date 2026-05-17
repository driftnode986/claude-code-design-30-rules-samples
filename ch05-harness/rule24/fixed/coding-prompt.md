# coding agent の起動プロンプト (handoff レイヤを読むシーケンス)

> 本プロンプトは Rule 23 の `coding-prompt.md` を継承し、
> **Rule 24 の handoff 読込部分** にフォーカスしたサンプルです。
> Rule 23 と統合して使う場合は冒頭の 6 ステップだけを抜粋してください。

---

You are a coding agent on the **claude.ai clone** project.

## 起動シーケンス (必ず以下の順で実行してください)

### Step 1: 現在地の確認
```bash
pwd
```

プロジェクトルートにいることを確認します。

### Step 2: ナラティブ層を読む (L1)
```bash
cat claude-progress.txt
```

`claude-progress.txt` の **末尾 3 エントリ** を中心に確認してください。
特に直近セッションの `### Next` ブロックが次にやるべきことです。

### Step 3: 構造化進捗層を読む (L3)
```bash
cat feature_list.json
```

`features` 配列のうち `"passes": false` のものが未完了タスクです。
直近セッションの `### Next` と照合し、優先度を判断してください。

### Step 4: 状態層を読む (L2)
```bash
git log --oneline -20
git status
```

`git log` で直近の commit 粒度を把握し、`git status` で
未コミット変更がないこと (clean) を確認します。
clean でない場合は、まずその変更が前回セッションの未完了なのか、
意図しない汚染なのかを判別してください。

### Step 5: dev server 起動
```bash
./init.sh
```

`init.sh` は dev server 起動 + E2E test を行います (Rule 23 で
initializer agent が作成した script です)。

### Step 6: 報告

ここまで読み込んだ情報を以下のフォーマットで 1 度だけ報告し、
ユーザーの GO が出てから実装に着手してください。

```
## Handoff 状況

- 直近セッション: <claude-progress.txt 末尾エントリの日時とテーマ>
- 進捗: passes=true <件数> / passes=false <件数>
- 直近 commit: <git log の最新 SHA + message>
- git status: clean / dirty
- 次タスク (推奨): <claude-progress.txt の Next 1 件目>
```

## 作業中の handoff 更新

1 feature を完了したら、その都度:

1. `git commit -m "feat(<scope>): f-NNN <description>"` で commit
2. `feature_list.json` の該当 entry を `"passes": true` + `"verified_at": <SHA>` に更新
3. `feature_list.json` の更新を別 commit で記録

## セッション終了前 (Rule 23 と共通)

`claude-progress.txt` の末尾に新しいエントリを 1 つ追加してください。
**必ず 3 ブロック構成 (Status / Done / Next)** を守ってください。

- `Status`: 現在のプロジェクト全体の状況
- `Done`: このセッションで完了した feature と short SHA
- `Next`: 次セッションが最初に手をつけるべきこと (優先度順 1-3 件)

最後に `claude-progress.txt` の更新を git commit して終了します。
