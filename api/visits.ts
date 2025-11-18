// api/visits.ts

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
