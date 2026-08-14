// Sends transactional emails through Resend. Server-side only.

export async function sendNewsletterWelcomeEmail(to: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] Missing RESEND_API_KEY");
    return;
  }

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; color: #1c1917;">offstories<span style="color: #78716c;">.</span></div>
      <div style="margin-top: 28px; font-size: 20px; font-weight: 600; color: #1c1917;">Terima kasih sudah berlangganan 💌</div>
      <p style="margin-top: 12px; font-size: 15px; line-height: 1.6; color: #44403c;">
        Checklist &amp; panduan persiapan pernikahan kamu sedang dikirim ke email ini secara bertahap.
        Mulai dari budgeting, timeline, sampai tips memilih vendor — satu tempat untuk semua.
      </p>
      <p style="margin-top: 12px; font-size: 15px; line-height: 1.6; color: #44403c;">
        Sementara menunggu, kamu bisa langsung mencoba <strong>OffStories dashboard gratis</strong> untuk
        mulai merapikan budget dan checklist hari-H.
      </p>
      <a href="https://offstories.fun/auth"
         style="display: inline-block; margin-top: 20px; padding: 12px 24px; border-radius: 9999px; background: #1c1917; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">
        Coba Dashboard Gratis
      </a>
      <p style="margin-top: 28px; font-size: 12px; color: #a8a29e;">
        Kamu menerima email ini karena berlangganan newsletter offstories. Kamu bisa unsubscribe kapan saja.
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "offstories <no-reply@offstories.fun>",
        to: [to],
        subject: "Selamat datang di offstories! Checklist wedding-mu dalam perjalanan 💌",
        html,
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend error ${res.status}`, await res.text());
    }
  } catch (e) {
    console.error("[email] Failed to send newsletter welcome", e);
  }
}

export async function sendPartnerInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  workspaceName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] Missing RESEND_API_KEY");
    return;
  }

  const subject = `You're invited to plan "${opts.workspaceName}" together`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "offstories <no-reply@offstories.fun>",
        to: [opts.to],
        subject,
        text: [
          `You've been invited to plan "${opts.workspaceName}" together in offstories.`,
          "",
          "Accept the invitation here:",
          opts.inviteUrl,
          "",
          "If you don't have an account yet, create one with the same email address, confirm it, then open the link again.",
          "",
          "— offstories",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend error ${res.status}`, await res.text());
    }
  } catch (e) {
    console.error("[email] Failed to send", e);
  }
}
