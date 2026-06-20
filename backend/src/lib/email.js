const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Vantage <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Only create a client when configured, so the app runs without email in dev.
const resend = apiKey ? new Resend(apiKey) : null;

function verifyEmailHtml({ name, link }) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b">
    <div style="font-size:18px;font-weight:600;margin-bottom:28px">Vantage</div>
    <h1 style="font-size:20px;margin:0 0 12px">Verify your email</h1>
    <p style="color:#52525b;line-height:1.6;margin:0 0 24px">
      Hi ${name || "there"}, confirm your email address to finish setting up your Vantage workspace.
    </p>
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:500">
      Verify email
    </a>
    <p style="color:#a1a1aa;font-size:13px;line-height:1.6;margin:28px 0 0">
      Or paste this link into your browser:<br>
      <a href="${link}" style="color:#4f46e5;word-break:break-all">${link}</a>
    </p>
    <p style="color:#a1a1aa;font-size:13px;margin:24px 0 0">
      If you didn't create a Vantage account, you can safely ignore this email.
    </p>
  </div>`;
}

// Sends the verification email. Never throws into the request path: if email is
// unconfigured or the provider rejects (for example the Resend test domain only
// delivers to the account owner), we log and report sent:false instead.
async function sendVerificationEmail({ to, name, token }) {
  const link = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set; verify link for ${to}: ${link}`);
    return { sent: false };
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Verify your email for Vantage",
      html: verifyEmailHtml({ name, link }),
    });
    return { sent: true };
  } catch (err) {
    console.error("verification email failed:", err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendVerificationEmail };
