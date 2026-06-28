// api/projectsAWS.ts
import { createClient } from "@supabase/supabase-js";
import { FALLBACK_PROJECTS, applyFallbackFilters } from "./projectsFallback";

type ProjectsQuery = {
  limit?: string;
  offset?: string;
  featured?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export async function fetchProjectsAWS(q: ProjectsQuery) {
  const { limit, offset, featured } = q;

  try {
    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (featured === "true") query = query.eq("featured", true);

    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    if (limitNum && !isNaN(limitNum) && limitNum > 0) {
      query = query.limit(limitNum);
    }

    if (offsetNum !== undefined && !isNaN(offsetNum) && offsetNum >= 0) {
      const end = offsetNum + (limitNum ? limitNum - 1 : 9);
      query = query.range(offsetNum, end);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase error, using fallback data:", error.message);
      const fallback = applyFallbackFilters(FALLBACK_PROJECTS, q);
      return { statusCode: 200, body: { success: true, data: fallback, count: fallback.length, source: "fallback" } };
    }

    return {
      statusCode: 200,
      body: { success: true, data: data || [], count: data?.length || 0 },
    };
  } catch (err: any) {
    console.warn("Projects AWS error, using fallback data:", err.message);
    const fallback = applyFallbackFilters(FALLBACK_PROJECTS, q);
    return { statusCode: 200, body: { success: true, data: fallback, count: fallback.length, source: "fallback" } };
  }
}
