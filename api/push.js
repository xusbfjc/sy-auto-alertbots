const { createCanvas, registerFont } = require("canvas");
const fetch = require("node-fetch");
const FormData = require("form-data");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol, side, leverage, entryPrice, lastPrice, profitRate } = req.body;

    // 注册中文字体
    registerFont(path.join(__dirname, "../fonts/NotoSansSC-Regular.ttf"), { family: "NotoSans" });

    const width = 800, height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 背景
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // 标题
    ctx.fillStyle = "#fcd535";
    ctx.font = "28px NotoSans";
    ctx.fillText("币安合约", 40, 60);

    // 多空方向
    ctx.fillStyle = side === "long" ? "#00c087" : "#f6465d";
    ctx.font = "26px NotoSans";
    ctx.fillText(side === "long" ? "多" : "空", 40, 120);

    // 杠杆 & 币种
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px NotoSans";
    ctx.fillText(`${leverage}x  ${symbol}`, 100, 120);

    // 盈亏百分比
    ctx.fillStyle = side === "long" ? "#00c087" : "#f6465d";
    ctx.font = "bold 50px NotoSans";
    ctx.fillText(`${profitRate.toFixed(2)}%`, 40, 200);

    // 开仓 & 最新价格
    ctx.fillStyle = "#cccccc";
    ctx.font = "22px NotoSans";
    ctx.fillText(`开仓价格   ${entryPrice}`, 40, 280);
    ctx.fillText(`最新价格   ${lastPrice}`, 40, 320);

    // 导出图片
    const buffer = canvas.toBuffer("image/png");

    // 发送到 Telegram
    const tgUrl = `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", process.env.TG_CHAT_ID);
    formData.append("caption", `${symbol} ${side.toUpperCase()} ${profitRate.toFixed(2)}%`);
    formData.append("photo", buffer, "binance-card.png");

    await fetch(tgUrl, { method: "POST", body: formData });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
