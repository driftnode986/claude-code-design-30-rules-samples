// アンチパターン: 常に detailed (全フィールド) を返す Tool。
// 結果として、agent が send_message(id=...) のために id だけ
// 知りたいケースでも、毎回 206 tokens 級の応答を context に積む。

export const searchUserTool = {
  name: "search_user",
  description: "Search for a user by name and return user profile.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "User's display name." },
    },
    required: ["name"],
  },
};

export interface User {
  id: string;
  uuid: string;
  display_name: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  manager_id: string;
  manager_uuid: string;
  hire_date: string;
  office_location: string;
  timezone: string;
  preferred_language: string;
  avatar_256_url: string;
  avatar_512_url: string;
  avatar_mime_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Tool 実装: 全フィールドを毎回返す (206 tokens 想定)
export async function searchUser(input: { name: string }): Promise<User> {
  const user = await db.users.findOne({ display_name: input.name });
  return user;
}

declare const db: {
  users: { findOne: (q: Record<string, unknown>) => Promise<User> };
};
