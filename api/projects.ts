// api/projects.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { FALLBACK_PROJECTS, applyFallbackFilters } from "./projectsFallback";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { limit, offset, featured } = req.query;

    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (featured === "true") query = query.eq("featured", true);

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) query = query.limit(limitNum);
    }

    if (offset) {
      const offsetNum = parseInt(offset as string, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        const end = offsetNum + (limit ? parseInt(limit as string, 10) - 1 : 9);
        query = query.range(offsetNum, end);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase error, using fallback data:", error.message);
      const fallback = applyFallbackFilters(FALLBACK_PROJECTS, {
        limit: limit as string,
        offset: offset as string,
        featured: featured as string,
      });
      return res.status(200).json({ success: true, data: fallback, count: fallback.length, source: "fallback" });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (err: any) {
    console.warn("Projects API error, using fallback data:", err.message);
    const { limit, offset, featured } = req.query;
    const fallback = applyFallbackFilters(FALLBACK_PROJECTS, {
      limit: limit as string,
      offset: offset as string,
      featured: featured as string,
    });
    return res.status(200).json({ success: true, data: fallback, count: fallback.length, source: "fallback" });
  }
}
