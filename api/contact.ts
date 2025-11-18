import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as yup from 'yup';

// Create Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Validation schema
const contactSchema = yup.object().shape({
  name: yup.string().required().min(2),
  email: yup.string().email().required(),
  message: yup.string().required().min(5),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, message } = req.body;

    // Server-side validation
    await contactSchema.validate({ name, email, message });

    // Insert into Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message, created_at: new Date() }]);

    if (error) throw error;

    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Validation or DB error' });
  }
}
