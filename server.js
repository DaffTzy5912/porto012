const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;

const TELEGRAM_BOT_TOKEN = "8160121155:AAGYo5YFLZUqi1jq6nwzY6XOGzH8cTzVJJ0";
const TELEGRAM_USER_ID = "7341190291"; 

// Tampilkan halaman utama
app.get("/", async (req, res) => {
    // Kirim notifikasi ke Telegram
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const text = `Woi Bang! Ada yang baru buka websitemu nih!\nIP: ${ip}\nUser-Agent: ${req.headers['user-agent']}`;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_USER_ID,
            text
        });
    } catch (err) {
        console.error("Gagal kirim ke Telegram:", err.message);
    }

    res.sendFile(path.join(__dirname, "index.html")); // Ganti ke file HTML utama kamu
});

// Start server
app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});
