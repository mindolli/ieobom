import { getSupabaseAdmin, getSupabaseConfigStatus, handleOptions, requireApiKey, sendJson } from "./_shared.js";

const mockIssue = {
  issue_id: "mock_issue_001",
  stage: "sorting",
  issue_type: "mismatch",
  title: "입고량과 선별 결과 합계가 다릅니다.",
  detail: { actual_boxes: 38, sorted_sum: 37 },
  shipment_id: "mock_shipment_001"
};

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireApiKey(req, res)) return;

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: { code: "method_not_allowed", message: "GET만 지원합니다." } });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const config = getSupabaseConfigStatus();
    if (config.hasUrl && !config.hasServerKey) {
      return sendJson(res, 500, {
        error: {
          code: "supabase_server_key_missing",
          message: "Vercel 환경변수에 SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY가 필요합니다."
        },
        config
      });
    }
    return sendJson(res, 200, { data: [mockIssue], meta: { count: 1, source: "mock" } });
  }

  let query = supabase.from("v_issue_candidates").select("*");
  if (req.query.stage) query = query.eq("stage", req.query.stage);
  if (req.query.issue_type) query = query.eq("issue_type", req.query.issue_type);

  const { data, error } = await query;
  if (error) return sendJson(res, 500, { error: { code: "supabase_error", message: error.message } });

  return sendJson(res, 200, { data, meta: { count: data.length, source: "supabase" } });
}
