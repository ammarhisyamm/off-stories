// Sends transactional emails through Resend. Server-side only.

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
