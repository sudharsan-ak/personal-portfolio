import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as yup from "yup";
import nodemailer from "nodemailer";

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) {
  console.error("Missing SMTP email environment variables!");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

// Validation schema
const contactSchema = yup.object().shape({
  name: yup.string().required().min(2),
  email: yup.string().email().required(),
  message: yup.string().required().min(5),
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { name, email, message } = req.body;

    console.log("Received contact form submission:", { name, email, message });

    // Server-side validation
    await contactSchema.validate({ name, email, message });
    console.log("Validation passed");

    // Get user IP and User-Agent
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Insert into Supabase
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ name, email, message, created_at: new Date() }]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Inserted into Supabase:", data);

    // Send email notification
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${SMTP_USER}>`,
      to: EMAIL_TO,
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <hr/>
        <p><strong>IP:</strong> ${ip}</p>
        <p><strong>User-Agent:</strong> ${userAgent}</p>
      `,
    });

    console.log("Email sent successfully");

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error — check logs" });
  }
}
