
import fetch from "node-fetch";

const TELEGRAM_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    const text = body.text ? JSON.stringify(body.text, null, 2) : "收到推送";

    const photoUrl = "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png";

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        chat_id: CHAT_ID,
        caption: text,
        photo: photoUrl
      })
    });

    const data = await response.json();
    console.log("TG API response:", data);

    res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
