const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Webhook подтверждение от Meta
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = '123leonid456';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook подтвержден');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Запуск клиента WhatsApp через Baileys
async function startSock() {
  console.log('⏳ Запуск Baileys...');
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);
}

startSock().catch(err => console.error('Ошибка при запуске Baileys:', err));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
