const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;

// MySQL bağlantısı (önceki bilgilerle aynı)
const connection = mysql.createConnection({
    host: "mysqlasteriondb-asteriondb1.f.aivencloud.com",
    port: 25069,
    user: "avnadmin",
    password: "process.env.SERVICE_PASSWORD",
    database: "defaultdb",
    ssl: { rejectUnauthorized: false }
});

connection.connect(err => {
    if (err) { console.error("Database bağlantı hatası:", err); process.exit(1); }
    console.log("MySQL bağlantısı başarılı!");
});

// EJS'yi view engine olarak ayarla
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Statik dosyaları sun
app.use(express.static(__dirname));

// API endpoint
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

// Bakım listesini EJS üzerinden render et
app.get("/bakim", async (req, res) => {
    // API'den verileri çekin (veya doğrudan veritabanı sorgusu yapabilirsiniz)
    connection.query("SELECT ad, sonbakim, bakimbilgi, bakimfoto, cl, ph FROM musteriler", (err, results) => {
        if (err) return res.status(500).send("Hata oluştu");
        res.render("bakim", { bakimlar: results });
    });
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} üzerinde çalışıyor.`);
});
