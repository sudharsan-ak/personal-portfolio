// api/projects.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { limit, offset, featured } = req.query;

    // Start building the query
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

    // Optional filtering
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

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return res.status(404).json({
          error: "Projects table not found",
          message: "The 'projects' table does not exist in the database. Please create it in Supabase.",
        });
      }
      return res.status(500).json({ error: "Failed to fetch projects", details: error.message });
    }

    // Return results
    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (err: any) {
    console.error("Projects API error:", err);
    return res.status(500).json({ error: "Server error", message: err.message || "An unexpected error occurred" });
  }
}
