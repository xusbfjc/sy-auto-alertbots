# sy-auto-alertbot

TradingView ➜ Vercel (Serverless) ➜ Telegram 推送机器人  
支持 Binance 风格合约卡片图。

## 部署步骤

1. 克隆仓库并上传到 GitHub。
2. 在 Vercel 绑定仓库自动部署。
3. 在 Vercel → Settings → Environment Variables 添加：
   - `TG_BOT_TOKEN`
   - `TG_CHAT_ID`
4. TradingView 警报 Webhook URL 填写：
   ```
   https://<your-vercel-project>.vercel.app/api/push
   ```
