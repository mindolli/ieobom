import { getSupabaseAdmin, getSupabaseConfigStatus, handleOptions, requireApiKey, sendJson } from "./_shared.js";

const mockSettlement = {
  farm_name: "김성호 농가",
  crop_name: "방울토마토",
  confirmed_boxes: 37,
  grade_boxes: { special: 8, high: 20, normal: 7, low: 2 },
  fees: { sorting_fee: 12000, transport_fee: 8000, commission_fee: 3500 },
  settlement_status: "settlement_ready"
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
    return sendJson(res, 200, { data: [mockSettlement], meta: { count: 1, source: "mock" } });
  }

  const { data, error } = await supabase
    .from("settlement_records")
    .select("*, shipments!inner(id, shipment_date, total_boxes, farms(name), crops(name))")
    .order("created_at", { ascending: false });

  if (error) return sendJson(res, 500, { error: { code: "supabase_error", message: error.message } });

  return sendJson(res, 200, { data, meta: { count: data.length, source: "supabase" } });
}
