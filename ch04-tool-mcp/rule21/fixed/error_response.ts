// truncation 時の steering message と error response の良い例 / 悪い例。
// Anthropic Engineering Blog "Writing effective tools for agents"
// L195-211 が根拠。

export interface ToolError {
  isError: true;
  content: string;
}

// 悪い例 1: 不透明なエラーコード。
// agent は何をすればよいか分からず、同じ呼び出しを繰り返す。
export function badErrorOpaque(): ToolError {
  return {
    isError: true,
    content: "ERR_INVALID_PARAM_0042",
  };
}

// 悪い例 2: スタックトレースを丸投げ。
// agent の context を埋め、しかも改善方法を含まない。
export function badErrorStackTrace(err: Error): ToolError {
  return {
    isError: true,
    content: err.stack ?? err.message,
  };
}

// 良い例: 何がダメで、どう直すかを明示。
// agent は次の呼び出しで自動的に修正できる。
export function goodErrorActionable(invalid: {
  param: string;
  value: unknown;
}): ToolError {
  return {
    isError: true,
    content: [
      `Invalid value for parameter '${invalid.param}': ${JSON.stringify(
        invalid.value,
      )}.`,
      "",
      `Expected format: ISO 8601 date (e.g., '2026-05-17').`,
      "",
      "To fix this call, retry with a date string like:",
      `  ${invalid.param}: "2026-05-17"`,
    ].join("\n"),
  };
}

// truncation 時の steering message。
// agent に「次は範囲を絞って再呼び出ししろ」と誘導する。
export function truncationSteer(
  truncatedCount: number,
  totalCount: number,
  hint: { suggested_filter: string },
): string {
  return [
    `Response truncated: showing ${truncatedCount} of ${totalCount} results.`,
    "",
    "To retrieve more relevant results, retry with a narrower filter:",
    `  ${hint.suggested_filter}`,
    "",
    "Prefer multiple targeted searches over one broad search.",
  ].join("\n");
}
