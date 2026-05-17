# 「学んだことを組み込んだ」再起動プロンプト テンプレート

Fail twice rule で `/clear` した後、**元のプロンプトを再投入してはいけない**。
それは同じ失敗を再生産する。

Anthropic 公式 `Best practices for Claude Code` L181, L272:

> A clean session with a better prompt almost always outperforms a long session
> with accumulated corrections.
> After two failed corrections, /clear and write a better initial prompt
> incorporating what you learned.

学んだことを組み込んだ初期プロンプトのテンプレートを示す。

## テンプレート構造 (5 要素)

```
1. タスク (動詞 + 目的語)
2. 制約 (前回失敗で学んだこと = 解像度を上げる主要素)
3. 依存関係 (前回失敗で気づいた周辺要素)
4. 検証手段 (テスト / コマンド / 期待出力)
5. スコープ境界 (やらないこと)
```

## 例 1: テスト追加タスク (失敗履歴あり)

### 失敗履歴 (要約)

```
セッション A: src/components/ProductCard.vue のテストを書いて
→ 6 回連続修正 (useRoute モック、Pinia store mock、props 渡し)
→ /clear
```

### 再起動プロンプト (学習組込済)

```
Vue 3 + Vitest 環境で src/components/ProductCard.vue のテストを書いて
ください。

制約:
- vue-router の useRoute() を vi.mock() でモック必須 (戻り値の型は
  RouteLocationNormalizedLoaded)
- Pinia store 依存あり、createTestingPinia を使って initialState を渡す
- @vue/test-utils の mount で props (product: ProductDto, onAdd: Function)
  を渡す
- カバレッジ: 通常表示 / カートに追加 / 在庫切れ表示 の 3 ケース

検証:
- npx vitest run src/components/ProductCard.test.ts が PASS

スコープ外:
- E2E テスト (別タスク)
- ストアのテスト (別ファイルで管理済み)
```

→ 失敗履歴の「気づき」(useRoute モック / Pinia mock / props 型 / 検証コマンド) を
すべて初期プロンプトに組み込んでいるため、context は健全なまま 1 回で目的を達成できる。

## 例 2: バグ修正タスク (失敗履歴あり)

### 失敗履歴 (要約)

```
セッション B: ログインバグを修正
→ 「symptom が再現しない」「ログを見たがどこで失敗しているかわからない」
   「とりあえず try/catch を増やしたが何も改善しない」を 3 回
→ /clear
```

### 再起動プロンプト (学習組込済)

```
src/auth/ のログインバグを修正してください。

症状:
- ユーザーがセッションタイムアウト後に再ログインを試みると、最初の試行で
  401 が返り、2 回目以降は通常に通る

調査方針:
- src/auth/token-refresh.ts のリフレッシュロジックが対象
- session timeout 直後のリフレッシュトークン取得処理を疑う
- 失敗ログは console.error("token refresh failed", err) の形で出ているはず

期待する完成形:
- まず失敗を再現する failing test を src/auth/token-refresh.test.ts に追加
- そのテストを PASS させる修正を src/auth/token-refresh.ts に入れる
- 副作用: 既存のテストすべて PASS のまま (npx vitest run)

スコープ外:
- リフレッシュトークンのストレージ層 (LocalStorage → Cookie 移行は別タスク)
- /api/auth/login エンドポイントの仕様変更
```

→ 失敗履歴の「症状」「疑う場所」「ログの場所」「完成形の検証手段」を
組み込んでいるため、再起動セッションでは「探索」フェーズが不要になる。

## 例 3: 学んだことを組み込まない悪い再起動 (アンチパターン)

```
[Bad] /clear
[Bad] テストを書いて
[Bad] (Claude が全文脈を失った状態で推測ベースのテストを生成)
[Bad] テストが落ちる
[Bad] ... (同じループ再開)
```

`/clear` は context をリセットするが、ユーザーの **学習** までリセットしない。
学んだことを組み込まない再起動は、リセットせずに 7 回目の修正を依頼するのと
ほぼ同じ結果になる。

## 公式根拠

- Anthropic 公式 L181: "almost always outperforms" — 「ほぼ常に」勝るが
  「常に」勝るわけではない (情報密度が低い再起動プロンプトでは負ける)
- L272: "incorporating what you learned" — この一句が Fail twice rule の
  運用上最も重要な指示
