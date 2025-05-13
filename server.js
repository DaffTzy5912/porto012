const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;

const TELEGRAM_BOT_TOKEN = "7990890271:AAFHGe2etMiRhZxaZj8JbcVHdPnBx-yHqB8";
const TELEGRAM_USER_ID = "7341190291";

const viewerLogPath = path.join(__dirname, "viewers.json");

// Middleware
app.use(express.json());

// Tampilkan halaman utama dan kirim notifikasi Telegram
app.get("/", async (req, res) => {
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const waktu = new Date().toISOString();

    // Simpan data viewer
    let viewers = [];
    if (fs.existsSync(viewerLogPath)) {
        viewers = JSON.parse(fs.readFileSync(viewerLogPath));
    }
    viewers.push({ ip, userAgent, waktu });
    fs.writeFileSync(viewerLogPath, JSON.stringify(viewers, null, 2));

    // Kirim notifikasi ke Telegram
    const text = `🚨 Website kamu dibuka!\nIP: ${ip}\nUser-Agent: ${userAgent}\nWaktu: ${waktu}`;
    await axios.post(`https://api.telegram.org/bot ${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_USER_ID,
        text
    });

    res.sendFile(path.join(__dirname, "index.html")); // Ganti dengan nama file HTML kamu
});

// Webhook Telegram
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/cekviewer") {
        let responseText = "📊 Daftar Viewer:\n\n";

        if (fs.existsSync(viewerLogPath)) {
            const list = JSON.parse(fs.readFileSync(viewerLogPath));

            if (list.length === 0) {
                responseText = "Belum ada viewer.";
            } else {
                list.forEach((item, index) => {
                    responseText += `${index + 1}. ${item.waktu} | ${item.ip} | ${item.userAgent}\n`;
                });
            }
        } else {
            responseText = "File viewer tidak ditemukan.";
        }

        await axios.post(`https://api.telegram.org/bot ${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: responseText
        });
    }

    res.sendStatus(200);
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
