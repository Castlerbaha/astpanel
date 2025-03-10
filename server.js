// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MySQL bağlantı ayarları (.env dosyasından çekiliyor)
const connection = mysql.createConnection({
    host: process.env.DB_HOST || "mysqlasteriondb-asteriondb1.f.aivencloud.com",
    port: process.env.DB_PORT || 25069,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD, // .env içerisindeki şifre
    database: process.env.DB_NAME || "defaultdb",
    ssl: { rejectUnauthorized: false }
});

connection.connect(err => {
    if (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log("MySQL connected successfully!");
});

// Statik dosyaları sun
app.use(express.static(path.join(__dirname)));

// API: Bakım verilerini döndürür
app.get("/api/bakimlar", (req, res) => {
    const sql = "SELECT ad, sonbakim, bakimbilgi, bakimfoto, cl, ph FROM musteriler";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Data fetch error" });
        }
        res.json(results);
    });
});

// API: Müşteri verilerini döndürür
app.get("/api/musteriler", (req, res) => {
    // Müşteri listesi için: ad, borc, hesapguncellenme (sonkontrol) ve numara
    const sql = "SELECT ad, borc, hesapguncellenme AS sonkontrol, numara FROM musteriler";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Query error:", error);
            return res.status(500).json({ error: "Data fetch error" });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
