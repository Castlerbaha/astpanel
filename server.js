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

// Statik dosyaları public klasöründen sun
app.use(express.static(path.join(__dirname, "public")));

// MySQL Connection Pool oluşturuluyor
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

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
    const sql = "SELECT ad, borc, hesapguncellenme AS sonkontrol, numara FROM musteriler";
    pool.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
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

app.listen(port, () => {
    console.log(`Server http://localhost:${port} üzerinde çalışıyor.`);
});
