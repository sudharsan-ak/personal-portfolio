import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import * as yup from "yup";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// Ensure environment variables exist
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables!");
}

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_TO) {
  console.error("Missing SMTP email environment variables!");
}

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable! Fallback email will not work.");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

// Validation schema
const contactSchema = yup.object().shape({
  name: yup.string().required().min(2),
  email: yup.string().email().required(),
  message: yup.string().required().min(5),
});

// Gmail SMTP transporter (primary)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Resend client (fallback, used if Gmail SMTP fails)
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function buildEmailHtml(name: string, email: string, message: string, ip: string, userAgent: string) {
  return `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong><br/>${message}</p>
    <hr/>
    <p><strong>IP:</strong> ${ip}</p>
    <p><strong>User-Agent:</strong> ${userAgent}</p>
  `;
}

async function sendNotificationEmail(name: string, email: string, message: string, ip: string, userAgent: string) {
  const subject = `New message from ${name}`;
  const html = buildEmailHtml(name, email, message, ip, userAgent);

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${SMTP_USER}>`,
      to: EMAIL_TO,
      subject,
      html,
    });
    console.log("Email sent successfully via Gmail SMTP");
    return;
  } catch (smtpErr) {
    console.error("Gmail SMTP send failed, falling back to Resend:", smtpErr);
  }

  if (!resend) {
    throw new Error("Gmail SMTP failed and Resend fallback is not configured");
  }

  const { error } = await resend.emails.send({
    from: "Portfolio Contact Form <onboarding@resend.dev>",
    to: EMAIL_TO!,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend fallback also failed: ${error.message}`);
  }

  console.log("Email sent successfully via Resend fallback");
}

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
      .insert([{ name, email, message, ip, user_agent: userAgent, created_at: new Date() }]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("Inserted into Supabase:", data);

    // Send email notification (Gmail SMTP, falling back to Resend on failure)
    await sendNotificationEmail(name, email, message, ip ?? "Unknown", userAgent);

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error - check logs" });
  }
}
