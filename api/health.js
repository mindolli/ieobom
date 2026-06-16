import { getSupabaseAdmin, getSupabaseConfigStatus, handleOptions, requireApiKey, sendJson } from "./_shared.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireApiKey(req, res)) return;

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: { code: "method_not_allowed", message: "GET만 지원합니다." } });
  }

  const config = getSupabaseConfigStatus();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return sendJson(res, config.hasUrl ? 500 : 200, {
      ok: !config.hasUrl,
      mode: config.hasUrl ? "misconfigured" : "mock",
      config,
      message: config.hasUrl
        ? "Supabase URL은 있지만 서버용 키가 없습니다."
        : "Supabase 환경변수가 없어 mock 모드로 동작합니다."
    });
  }

  const { error } = await supabase.from("organizations").select("id").limit(1);

  return sendJson(res, error ? 500 : 200, {
    ok: !error,
    mode: "supabase",
    config,
    error: error ? { code: "supabase_error", message: error.message } : null
  });
}
