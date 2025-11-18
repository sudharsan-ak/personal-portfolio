import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as yup from 'yup';

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

// Validation schema
const contactSchema = yup.object().shape({
  name: yup.string().required().min(2),
  email: yup.string().email().required(),
  message: yup.string().required().min(5),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Log incoming data
    console.log("Received contact form submission:", { name, email, message });

    // Server-side validation
    await contactSchema.validate({ name, email, message });
    console.log("Validation passed");

    // Insert into Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message, created_at: new Date() }]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Inserted into Supabase:", data);
    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return res
      .status(500)
      .json({ message: err.message || 'Server error — check logs' });
  }
}
