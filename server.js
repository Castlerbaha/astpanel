// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MySQL Connection Pool oluşturuluyor
const pool = mysql.createPool({
    host: process.env.DB_HOST || "mysqlasteriondb-asteriondb1.f.aivencloud.com",
    port: process.env.DB_PORT || 25069,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD,  // .env dosyanızdan okunuyor
    database: process.env.DB_NAME || "defaultdb",
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,    // Aynı anda 10 bağlantıya kadar izin verir
    queueLimit: 0,
    connectTimeout: 10000   // 10 saniyelik bağlantı zaman aşımı
});

// Statik dosyaların sunulması (index.html, bakim.html, musteriler.html, vb.)
app.use(express.static(path.join(__dirname)));

// API Endpoint: Bakım verileri
app.get("/api/bakimlar", (req, res) => {
    const sql = "SELECT ad, sonbakim, bakimbilgi, bakimfoto, cl, ph, calisan FROM musteriler";
    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
    });
});

// API Endpoint: Müşteri verileri
app.get("/api/musteriler", (req, res) => {
    // Veritabanındaki sütun isimlerine göre sorgu;
    // ad, borc, hesapguncellenme (sonkontrol alias) ve numara döndürülüyor
    const sql = "SELECT ad, borc, hesapguncellenme AS sonkontrol, numara FROM musteriler";
    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} üzerinde çalışıyor.`);
});
