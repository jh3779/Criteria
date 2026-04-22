import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase";
import type { Locale } from "@/lib/i18n";
import type { AiLog, AiLogRow, StructuredThinking } from "@/lib/types";

type SaveAiLogInput = {
  question: string;
  locale: Locale;
  model: string;
  structured: StructuredThinking;
};

type ListAiLogsParams = {
  status?: AiLog["status"];
  limit?: number;
};

function mapAiLogRow(row: AiLogRow): AiLog {
  return {
    id: row.id,
    question: row.question,
    locale: row.locale,
    model: row.model,
    responseJson: row.response_json,
    status: row.status,
    promotedPostId: row.promoted_post_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function saveAiLog(input: SaveAiLogInput): Promise<string | null> {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ai_logs")
    .insert({
      question: input.question,
      locale: input.locale,
      model: input.model,
      response_json: input.structured,
      status: "generated"
    })
    .select("id")
    .single();

  if (error) {
    console.error(`Failed to persist ai log: ${error.message}`);
    return null;
  }

  return data?.id ?? null;
}

export async function markAiLogPromoted(aiLogId: string, postId: string): Promise<void> {
  if (!hasSupabaseAdminConfig()) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ai_logs")
    .update({
      status: "promoted",
      promoted_post_id: postId
    })
    .eq("id", aiLogId);

  if (error) {
    throw new Error(`Failed to update ai log promotion state: ${error.message}`);
  }
}

export async function listAiLogs(params: ListAiLogsParams = {}): Promise<AiLog[]> {
  if (!hasSupabaseAdminConfig()) {
    return [];
  }

  const { status, limit = 20 } = params;
  const supabase = createSupabaseAdminClient();
  let request = supabase
    .from("ai_logs")
    .select("id,question,locale,model,response_json,status,promoted_post_id,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    request = request.eq("status", status);
  }

  const { data, error } = await request;
  if (error) {
    throw new Error(`Failed to load ai logs: ${error.message}`);
  }

  return (data ?? []).map((row) => mapAiLogRow(row as AiLogRow));
}

export async function getAiLogById(id: string): Promise<AiLog | null> {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ai_logs")
    .select("id,question,locale,model,response_json,status,promoted_post_id,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load ai log: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapAiLogRow(data as AiLogRow);
}
