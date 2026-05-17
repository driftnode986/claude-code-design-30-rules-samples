---
paths:
  - "src/**/*.{ts,tsx}"
---

# TypeScript / React コーディングルール

このファイルは `src/` 配下の TypeScript / TSX を読むときだけ
Claude のコンテキストに注入される。

## TypeScript

- `any` 禁止。代わりに `unknown` を使い型ガードで絞り込む
- `as` による型アサーションは外部入力 (fetch 結果等) を最初に絞るときだけ
- `interface` ではなく `type` を使う (本プロジェクトの選択)
- API レスポンスは zod でランタイム検証してから型を導出する

## React

- Server Component をデフォルト、Client Component は最小限
  (`'use client'` を必要な葉だけに付ける)
- props は分割代入で受け取り、デフォルト値は引数側で指定
- list レンダリングの `key` には DB の主キーを使う (index 禁止)
- `useEffect` を書く前に「Server Component で済まないか」を疑う

## 命名

- ファイル: kebab-case (`cart-sync.ts`)
- React コンポーネント: PascalCase (`CartSummary.tsx`)
- フック: `useXxx` で始める
