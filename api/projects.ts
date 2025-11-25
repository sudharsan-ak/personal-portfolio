// api/projects.ts

import { createClient } from "@supabase/supabase-js";

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Optional query params
    const { limit, offset, featured } = req.query;

    let query = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) query = query.limit(limitNum);
    }

    if (offset) {
      const offsetNum = parseInt(offset as string, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        query = query.range(
          offsetNum,
          offsetNum + (limit ? parseInt(limit as string, 10) - 1 : 9)
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, count: data?.length || 0, data: data || [] });
  } catch (err) {
    console.error("Projects API error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}
