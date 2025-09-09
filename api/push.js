
/**
 * Vercel Serverless Function
 * TradingView webhook -> draw Binance-style image -> Telegram sendPhoto (caption + image)
 * Env: TG_BOT_TOKEN, TG_CHAT_ID
 */

const PImage = require('pureimage');

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

function drawCard(data) {
  const W = 800, H = 450;
  const img = PImage.make(W, H);
  const ctx = img.getContext('2d');

  // Colors
  const bg = '#1A1A1A';
  const binanceYellow = '#FCD535';
  const longGreen = '#00D1B3';
  const shortRed = '#FF4E4E';
  const pnlGreen = '#00FF99';
  const white = '#FFFFFF';
  const gray = '#888888';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  // Title (Binance)
  ctx.fillStyle = binanceYellow;
  ctx.font = '32pt sans';
  ctx.fillText('币安合约', 40, 60);

  // Direction | Leverage | Symbol
  const side = (data.direction || '').trim() || '-';
  const lev = data.leverage ? ` | ${data.leverage}` : '';
  const sym = ((data.symbol || '') + '').replace('.P','') + ' 永续';
  ctx.fillStyle = side === '空' ? shortRed : longGreen;
  ctx.font = '22pt sans';
  ctx.fillText(`${side}${lev} | ${sym}`, 40, 110);

  // PnL
  const pnlText = data.pnl_percent || data.profit || '';
  if (pnlText) {
    ctx.fillStyle = pnlGreen;
    ctx.font = 'bold 56pt sans';
    ctx.fillText(`${pnlText}`, 40, 190);
  }

  // Entry / Last price
  ctx.fillStyle = binanceYellow;
  ctx.font = '20pt sans';
  const entry = data.entry_price != null ? String(data.entry_price) : (data.entry || '');
  const last = data.price != null ? String(data.price) : (data.currentPrice || '');
  if (entry) ctx.fillText(`开仓价格    ${entry}`, 40, 250);
  if (last)  ctx.fillText(`最新价格    ${last}`,  40, 290);

  // ts + tp
  ctx.fillStyle = gray;
  ctx.font = '16pt sans';
  const ts = data.ts || new Date().toISOString();
  const tp = data.tp_level ? ` | ${data.tp_level}` : '';
  ctx.fillText(`${ts}${tp}`, 40, 330);

  // Footer
  ctx.fillStyle = gray;
  ctx.font = '16pt sans';
  const title = data.title || 'SY Auto Push';
  const txtWidth = ctx.measureText(title).width;
  ctx.fillText(title, W-40 - txtWidth, H-40);

  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = {
      writable: true,
      write: (buf) => chunks.push(Buffer.from(buf)),
      end: () => resolve(Buffer.concat(chunks)),
      on: () => {},
      once: () => {}
    };
    PImage.encodePNGToStream(img, stream).catch(reject);
  });
}

function buildCaption(data) {
  const lines = [
    '🧠 推送止盈监控',
    data.symbol ? `币种：${data.symbol}` : null,
    data.direction && data.leverage ? `方向：${data.direction} × ${data.leverage}` : null,
    data.entry_price != null ? `开仓价：${data.entry_price}` : null,
    data.price != null ? `现价：${data.price}` : null,
    data.pnl_percent ? `收益率：${data.pnl_percent}` : null,
    data.action ? `系统操作：${data.action}` : null,
    data.status ? `状态：${data.status}` : null,
    data.tp_level ? `TP等级：${data.tp_level}` : null,
    data.ts ? `时间：${data.ts}` : null
  ].filter(Boolean);
  return lines.join('\n');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok:false, error: 'Use POST'});
    return;
  }
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    res.status(500).json({ ok:false, error: 'Missing TG_BOT_TOKEN or TG_CHAT_ID'});
    return;
  }

  try {
    const data = req.body || {};
    const caption = buildCaption(data);
    const buffer = await drawCard(data);

    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendPhoto`;
    const form = new FormData();
    form.append('chat_id', TG_CHAT_ID);
    form.append('caption', caption);
    form.append('photo', new Blob([buffer], { type: 'image/png' }), 'card.png');

    const resp = await fetch(url, { method: 'POST', body: form });
    const json = await resp.json();
    if (!json.ok) throw new Error(JSON.stringify(json));
    res.status(200).json({ ok: true, result: json.result });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
};
