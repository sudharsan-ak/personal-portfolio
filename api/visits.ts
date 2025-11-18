// api/visits.ts

import { createClient } from "@supabase/supabase-js";

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) {
  console.error("Missing SMTP email environment variables!");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

export default async function handler(req, res) {
  try {
    // Get current count
    let { data, error } = await supabase
      .from("api_visits")
      .select("count")
      .eq("id", 1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    let count = data ? data.count : 0;

    // Increment count
    count += 1;

    // Update or insert
    if (data) {
      await supabase.from("api_visits").update({ count }).eq("id", 1);
    } else {
      await supabase.from("api_visits").insert({ id: 1, count });
    }

    res.status(200).json({ visits: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get visits" });
  }
}
