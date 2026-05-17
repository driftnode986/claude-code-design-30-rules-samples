// 拡張版: 5 段階 enum + GraphQL 風 fields パラメータ。
// Anthropic Engineering Blog L170: "similar to GraphQL where you
// can choose exactly which pieces of information you want to receive"

export enum ResponseFormat {
  MINIMAL = "minimal", // id のみ
  CONCISE = "concise", // id + display_name (デフォルト)
  STANDARD = "standard", // concise + email + department
  DETAILED = "detailed", // standard + phone + job_title + office + hire_date
  RAW = "raw", // 全フィールド (uuid・manager_uuid・avatar_url 含む)
}

export const searchUserTool = {
  name: "search_user",
  description: [
    "Search for a user by name and return user profile.",
    "",
    "response_format options (token cost / use case):",
    "- minimal  (~20 tokens): id only, for chained tool calls",
    "- concise  (~72 tokens): id + display_name (default)",
    "- standard (~130 tokens): concise + email + department",
    "- detailed (~206 tokens): standard + phone + job + office",
    "- raw      (~340 tokens): everything (use only if asked)",
    "",
    "OR pass `fields` for GraphQL-style field selection:",
    "  fields: ['id', 'display_name', 'email']",
  ].join("\n"),
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "User's display name." },
      response_format: {
        type: "string",
        enum: Object.values(ResponseFormat),
        default: ResponseFormat.CONCISE,
      },
      fields: {
        type: "array",
        items: { type: "string" },
        description: [
          "Optional: GraphQL-style field selection.",
          "If set, overrides response_format.",
        ].join(" "),
      },
    },
    required: ["name"],
  },
};

const PRESETS: Record<ResponseFormat, string[]> = {
  [ResponseFormat.MINIMAL]: ["id"],
  [ResponseFormat.CONCISE]: ["id", "display_name"],
  [ResponseFormat.STANDARD]: [
    "id",
    "display_name",
    "email",
    "department",
  ],
  [ResponseFormat.DETAILED]: [
    "id",
    "display_name",
    "email",
    "department",
    "phone",
    "job_title",
    "office_location",
    "hire_date",
  ],
  [ResponseFormat.RAW]: [
    "id",
    "uuid",
    "display_name",
    "email",
    "phone",
    "department",
    "job_title",
    "manager_id",
    "manager_uuid",
    "office_location",
    "hire_date",
    "avatar_256_url",
    "avatar_512_url",
    "avatar_mime_type",
    "status",
    "created_at",
    "updated_at",
  ],
};

export async function searchUser(input: {
  name: string;
  response_format?: ResponseFormat;
  fields?: string[];
}): Promise<Record<string, unknown>> {
  const user = await db.users.findOne({ display_name: input.name });
  const fields =
    input.fields ?? PRESETS[input.response_format ?? ResponseFormat.CONCISE];

  const result: Record<string, unknown> = {};
  for (const f of fields) {
    if (f in user) result[f] = (user as Record<string, unknown>)[f];
  }
  return result;
}

declare const db: {
  users: {
    findOne: (q: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
};
