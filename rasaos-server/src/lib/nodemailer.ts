// nodemailer.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASS,
  },
});

type SendEmailParams = {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail({
  from,
  to,
  subject,
  text,
  html,
}: SendEmailParams) {
  const info = await transporter.sendMail({
    from: from,
    to,
    subject,
    text,
    html,
  });

  return info;
}
