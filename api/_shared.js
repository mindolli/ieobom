import { createClient } from "@supabase/supabase-js";

export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function requireApiKey(req, res) {
  const expected = process.env.EXTERNAL_API_KEY;
  if (!expected) return true;

  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token === expected) return true;

  if (!header && isSameOriginBrowserRequest(req)) return true;

  setCors(res);
  res.status(401).json({
    error: {
      code: "unauthorized",
      message: "유효한 API 키가 필요합니다."
    }
  });
  return false;
}

function isSameOriginBrowserRequest(req) {
  const fetchSite = req.headers["sec-fetch-site"];
  if (fetchSite === "same-origin" || fetchSite === "same-site") return true;

  const host = req.headers.host;
  const referer = req.headers.referer;
  if (!host || !referer) return false;

  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}

export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function getSupabaseConfigStatus() {
  return {
    hasUrl: Boolean(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServerKey: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasExternalApiKey: Boolean(process.env.EXTERNAL_API_KEY)
  };
}

export function sendJson(res, status, payload) {
  setCors(res);
  res.status(status).json(payload);
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}
