// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// EJS view engine ayarı
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statik dosyaları public klasöründen sun (CSS, JS, resimler)
app.use(express.static(path.join(__dirname, "public")));

// JSON gövdesini parse edebilmek için
app.use(express.json());

// MySQL Connection Pool (sürekli bağlı kalmak için)
const pool = mysql.createPool({
    host: process.env.DB_HOST || "mysqlasteriondb-asteriondb1.f.aivencloud.com",
    port: process.env.DB_PORT || 25069,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD, // .env içerisindeki şifre
    database: process.env.DB_NAME || "defaultdb",
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

// API Endpoint: Bakım verilerini döndürür
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

// API Endpoint: Müşteri verilerini döndürür
app.get("/api/musteriler", (req, res) => {
    const sql = "SELECT ad, borc, hesapguncellenme AS sonkontrol, numara FROM musteriler";
    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
    });
});

// API Endpoint: Bakım güncelleme (POST)
app.post("/api/bakim/update", (req, res) => {
    const { ad, field, value } = req.body;
    const allowedFields = ["cl", "ph", "bakimbilgi", "sonbakim", "calisan", "bakimfoto"];
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ error: "Geçersiz alan" });
    }
    const sql = `UPDATE musteriler SET ${field} = ? WHERE ad = ?`;
    pool.query(sql, [value, ad], (error, results) => {
        if (error) {
            console.error("Update error:", error);
            return res.status(500).json({ error: "Güncelleme hatası" });
        }
        res.json({ success: true });
    });
});

// Sayfa renderları
app.get("/", (req, res) => {
    res.render("index", { title: "Admin Panel - Anasayfa" });
});
app.get("/bakim", (req, res) => {
    res.render("bakim", { title: "Bakım Listesi" });
});
app.get("/musteriler", (req, res) => {
    res.render("musteriler", { title: "Müşteri Listesi" });
});
app.get("/bakimedit", (req, res) => {
    res.render("bakimedit", { title: "Bakım Düzenle" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
