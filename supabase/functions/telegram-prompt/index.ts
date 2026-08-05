Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("ok");
  }

  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== Deno.env.get("TELEGRAM_WEBHOOK_SECRET")) {
    return new Response("unauthorized", { status: 401 });
  }

  const update = await req.json();
  const message = update.message;
  if (!message?.text) {
    return new Response("ok");
  }

  const chatId = message.chat.id;
  const text = message.text.trim();
  const allowed = (Deno.env.get("ALLOWED_CHAT_IDS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (text === "/start") {
    await sendTelegram(
      chatId,
      "Bot prompt off-stories siap.\n\nKirim prompt seperti:\n/prompt Tambah fitur export PDF di halaman dokument",
    );
    return new Response("ok");
  }

  if (!allowed.includes(String(chatId))) {
    await sendTelegram(chatId, `Chat ID kamu: ${chatId}. Tambahkan ke ALLOWED_CHAT_IDS di fungsi.`);
    return new Response("ok");
  }

  if (!text.startsWith("/prompt")) {
    await sendTelegram(chatId, "Gunakan perintah /prompt diikuti instruksi.");
    return new Response("ok");
  }

  const prompt = text.replace(/^\/prompt\s*/, "").trim();
  if (!prompt) {
    await sendTelegram(chatId, "Prompt kosong. Contoh: /prompt Tambah tombol export.");
    return new Response("ok");
  }

  const owner = Deno.env.get("GITHUB_OWNER") ?? "ammarhisyamm";
  const repo = Deno.env.get("GITHUB_REPO") ?? "off-stories";
  const ghToken = Deno.env.get("GITHUB_TOKEN");
  if (!ghToken) {
    await sendTelegram(chatId, "GITHUB_TOKEN belum diset di fungsi.");
    return new Response("ok");
  }

  const dispatch = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/telegram-prompt.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "off-stories-telegram-prompt",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          prompt,
          chat_id: String(chatId),
        },
      }),
    },
  );

  if (!dispatch.ok) {
    const body = await dispatch.text();
    console.error("dispatch failed", dispatch.status, body);
    await sendTelegram(chatId, `Gagal trigger GitHub Actions (${dispatch.status}).`);
    return new Response("ok");
  }

  await sendTelegram(
    chatId,
    "Prompt diterima. Agent lagi jalan di GitHub Actions — hasil PR bakal dikirim ke sini.",
  );
  return new Response("ok");
});

async function sendTelegram(chatId: number | string, text: string) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
