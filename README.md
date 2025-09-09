
# sy-auto-alertbot (Vercel, Serverless)

TradingView -> Telegram (text + Binance-style image) push bot.

## Deploy on Vercel
1) Create a GitHub repository and upload this folder's files.
2) Go to https://vercel.com/new/import and import the repo.
3) Add environment variables:
   - TG_BOT_TOKEN = <your bot token>
   - TG_CHAT_ID   = <target chat id>

## Webhook (TradingView)
Use your deployment URL:
  https://<your-app>.vercel.app/api/push

Alert message JSON example:
```json
{
  "title": "推送止盈监控",
  "ts": "{{time}}",
  "symbol": "{{ticker}}",
  "price": {{close}},
  "tp_level": "TP1",
  "action": "已清仓获利",
  "status": "收益成功落袋",
  "direction": "空",
  "leverage": "75x",
  "entry_price": 4296.66,
  "pnl_percent": "+23.45%"
}
```
