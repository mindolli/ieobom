import { getSupabaseAdmin, handleOptions, parseBody, requireApiKey, sendJson } from "./_shared.js";

const mockShipment = {
  shipment_id: "mock_shipment_001",
  farm_name: "김성호 농가",
  crop_name: "방울토마토",
  shipment_date: "2026-06-18",
  total_boxes: 40,
  grades: { special: 10, high: 20, normal: 10 },
  arrival_method: "self_delivery",
  requested_arrival_time: "09:00",
  status: "submitted"
};

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (!requireApiKey(req, res)) return;

  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    if (!supabase) {
      return sendJson(res, 200, { data: [mockShipment], meta: { count: 1, source: "mock" } });
    }

    let query = supabase
      .from("v_shipment_sheet")
      .select("*")
      .order("created_at", { ascending: false });

    if (req.query.date) query = query.eq("shipment_date", req.query.date);
    if (req.query.status) query = query.eq("status", req.query.status);

    const { data, error } = await query;
    if (error) return sendJson(res, 500, { error: { code: "supabase_error", message: error.message } });

    return sendJson(res, 200, { data, meta: { count: data.length, source: "supabase" } });
  }

  if (req.method === "POST") {
    const body = parseBody(req);

    if (!supabase) {
      return sendJson(res, 201, {
        shipment_id: "mock_created_shipment",
        status: "submitted",
        issue_created: false,
        source: "mock",
        received: body
      });
    }

    const { data, error } = await supabase.rpc("submit_farmer_shipment", {
      p_org_slug: body.org_slug || "saebom",
      p_farm_id: body.farm_id,
      p_crop_id: body.crop_id,
      p_shipment_date: body.shipment_date,
      p_total_boxes: body.total_boxes,
      p_grade_boxes: body.grade_boxes || {},
      p_arrival_method: body.arrival_method,
      p_requested_arrival_time: body.requested_arrival_time,
      p_contact_phone: body.contact_phone || null,
      p_farmer_memo: body.farmer_memo || null
    });

    if (error) return sendJson(res, 400, { error: { code: "submit_failed", message: error.message } });

    return sendJson(res, 201, {
      shipment_id: data,
      status: "submitted",
      source: "supabase"
    });
  }

  return sendJson(res, 405, { error: { code: "method_not_allowed", message: "GET 또는 POST만 지원합니다." } });
}
