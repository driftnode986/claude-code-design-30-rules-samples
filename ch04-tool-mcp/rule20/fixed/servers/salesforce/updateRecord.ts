import { callMCPTool } from "../../../client.js";

interface UpdateRecordInput {
  objectType: string;
  recordId: string;
  data: Record<string, unknown>;
}

interface UpdateRecordResponse {
  success: boolean;
  recordId: string;
}

/* Update a record in Salesforce */
export async function updateRecord(
  input: UpdateRecordInput
): Promise<UpdateRecordResponse> {
  return callMCPTool<UpdateRecordResponse>('salesforce__update_record', input);
}
