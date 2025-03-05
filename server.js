// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config(); // .env dosyasındaki verileri yükler

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const app = express();
const port = 3000;


app.get("/", (req, res) => {
    res.render("index");
});


// MySQL bağlantı ayarları (env'den çekiliyor)
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
        console.error("Database bağlantı hatası:", err);
        process.exit(1);
    }
    console.log("MySQL bağlantısı başarılı!");
});

// EJS view engine ayarı
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statik dosyaları sun (CSS, JS, resimler, vb.)
app.use(express.static(__dirname));

// API: Bakım verilerini döndürür
app.get("/api/bakimlar", (req, res) => {
    const sql = "SELECT ad, sonbakim, bakimbilgi, bakimfoto, cl, ph FROM musteriler";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Sorgu hatası:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
    });
});

// API: Müşteri verilerini döndürür
app.get("/api/musteriler", (req, res) => {
    // Burada "son kontrol" için hesapguncellenme sütununu,
    // "numara" sütunu müşteri iletişimi için varsayıyoruz.
    const sql = "SELECT ad, hesapguncellenme AS sonkontrol, borc, numara FROM musteriler";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Sorgu hatası:", error);
            return res.status(500).json({ error: "Veri çekme hatası" });
        }
        res.json(results);
    });
});

// Sayfa renderları
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/bakim", (req, res) => {
    res.render("bakim");
});

app.get("/musteriler", (req, res) => {
    res.render("musteriler");
});

// Diğer sayfalar için benzer endpoint'ler eklenebilir

app.listen(port, () => {
    console.log(`Server http://localhost:${port} üzerinde çalışıyor.`);
});
