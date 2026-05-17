// 修正後: response_format enum で agent が応答粒度を制御。
// Anthropic Engineering Blog "Writing effective tools for agents"
// L172-177 の enum を完全踏襲。

export enum ResponseFormat {
  DETAILED = "detailed",
  CONCISE = "concise",
}

export const searchUserTool = {
  name: "search_user",
  description: [
    "Search for a user by name and return user profile.",
    "",
    "Pass response_format='concise' (default) when you only need",
    "the user's id and display_name for a downstream tool call",
    "(e.g., send_message(id=...)). This returns ~72 tokens.",
    "",
    "Pass response_format='detailed' when the user has explicitly",
    "asked for the user's full profile (e.g., 'show me Jane's",
    "contact info'). This returns ~206 tokens.",
  ].join("\n"),
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "User's display name.",
      },
      response_format: {
        type: "string",
        enum: [ResponseFormat.CONCISE, ResponseFormat.DETAILED],
        default: ResponseFormat.CONCISE,
        description: "Response verbosity. Default: 'concise'.",
      },
    },
    required: ["name"],
  },
};

export interface UserConcise {
  id: string;
  display_name: string;
}

export interface UserDetailed extends UserConcise {
  email: string;
  phone: string;
  department: string;
  job_title: string;
  office_location: string;
  hire_date: string;
}

export async function searchUser(input: {
  name: string;
  response_format?: ResponseFormat;
}): Promise<UserConcise | UserDetailed> {
  const format = input.response_format ?? ResponseFormat.CONCISE;
  const user = await db.users.findOne({ display_name: input.name });

  if (format === ResponseFormat.CONCISE) {
    return {
      id: user.id,
      display_name: user.display_name,
    };
  }

  return {
    id: user.id,
    display_name: user.display_name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    job_title: user.job_title,
    office_location: user.office_location,
    hire_date: user.hire_date,
  };
}

declare const db: {
  users: {
    findOne: (q: Record<string, unknown>) => Promise<{
      id: string;
      display_name: string;
      email: string;
      phone: string;
      department: string;
      job_title: string;
      office_location: string;
      hire_date: string;
    }>;
  };
};
