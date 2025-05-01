/* server.js – ORM yok, yalnızca mysql2 */
const express = require('express');
const mysql   = require('mysql2');          // <— mysql2 driver
const path    = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ----------  MySQL Pool  ---------- */
const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10
});

/* ----------  Middleware  ---------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

/* ----------  API: MÜŞTERİLER  ---------- */
app.get('/api/musteriler', (_, res) => {
    const q = `
        SELECT id, ad, numara, hesap, borc,
               DATE_FORMAT(created_at,'%d.%m.%Y %H:%i') AS sonkontrol
        FROM customers`;
    pool.query(q, (e, r) => e ? res.status(500).json(e) : res.json(r));
});

/* ----------  ARIZA API  ---------- */
// Liste – müşteri adı ile
app.get('/api/arizalar', (_, res) => {
    const q = `
    SELECT a.id,
           c.ad AS musteri,
           a.konu, a.aciklama, a.medya,
           DATE_FORMAT(a.tarih,'%Y-%m-%d %H:%i') AS tarih
    FROM ariza a
    JOIN customers c ON c.id = a.customer_id
    ORDER BY a.tarih DESC`;
    pool.query(q, (e, r) => e ? res.status(500).json(e) : res.json(r));
});

/* ----------  VIEW ROTA  ---------- */
app.get('/ariza', (_, r) => r.render('ariza', { title: 'Arıza Listesi' }));


/* ----------  API: ÇALIŞAN EKLE / SİL  ---------- */
app.post('/api/calisanlar/add', (req, res) => {
    const { ad, plaka, yetki, sifre } = req.body;
    pool.query(
        'INSERT INTO employees (ad, plaka, yetki, sifre_hash) VALUES (?,?,?,?)',
        [ad, plaka, yetki, sifre],
        e => e ? res.status(500).json(e) : res.json({ ok: true })
    );
});
app.post('/api/calisanlar/delete', (req, res) => {
    pool.query('DELETE FROM employees WHERE id=?', [req.body.id],
        e => e ? res.status(500).json(e) : res.json({ ok: true }));
});

/* ----------  API: ÇALIŞAN RAPORU  ---------- */
app.get('/api/calisanlar', (_, res) => {
    const q = `
        SELECT e.id, e.ad, e.plaka, e.konum,
               MIN(m.sonbakim) AS ilk_bakim,
               MAX(m.sonbakim) AS son_bakim,
               COUNT(m.id)     AS toplam_bakim
        FROM employees e
                 LEFT JOIN maintenance m
                           ON m.employee_id = e.id
                               AND DATE(m.sonbakim) = CURDATE()
        GROUP BY e.id
        ORDER BY e.ad`;
    pool.query(q, (e, r) => e ? res.status(500).json(e) : res.json(r));
});

/* ----------  API: BAKIM KAYITLARI  ---------- */
app.get('/api/bakimlarAll', (_, res) => {
    const q = `
    SELECT m.id, c.ad AS customer,
           DATE_FORMAT(m.sonbakim,'%Y-%m-%d %H:%i') AS sonbakim,
           m.bakimbilgi, m.bakimfoto, m.cl, m.ph, m.calisan
    FROM maintenance m
    JOIN customers c ON c.id = m.customer_id
    ORDER BY m.sonbakim DESC`;
    pool.query(q, (e, r) => e ? res.status(500).json(e) : res.json(r));
});

/* ----------  API: BAKIM GÜNCELLE  ---------- */
app.post('/api/bakim/update', (req, res) => {
    const { id, field, value } = req.body;
    const allow = ['cl', 'ph', 'bakimbilgi', 'sonbakim', 'calisan', 'bakimfoto'];
    if (!allow.includes(field) || !id)
        return res.status(400).json({ error: 'geçersiz' });

    pool.query(`UPDATE maintenance SET ${field}=? WHERE id=?`,
        [value, id],
        e => e ? res.status(500).json(e) : res.json({ ok: true }));
});

// Arıza kayıt API
app.post('/api/arizalar/add', (req, res) => {
    const { customerId, konu, aciklama, medya } = req.body;
    if (!customerId || !konu || !aciklama) return res.status(400).json({ error: 'Eksik bilgi!' });
    pool.query(
        `INSERT INTO ariza (customer_id, konu, aciklama, medya)
     VALUES (?,?,?,?)`,
        [customerId, konu, aciklama, medya],
        (e) => e ? res.status(500).json(e) : res.json({ ok: true })
    );
});


/* ----------  VIEW ROUTES  ---------- */
app.get('/',            (_, r) => r.render('index',       { title: 'Anasayfa' }));
app.get('/bakim',       (_, r) => r.render('bakim',       { title: 'Bakım' }));
app.get('/bakimedit',   (_, r) => r.render('bakimedit',   { title: 'Bakım Düzenle' }));
app.get('/musteriler',  (_, r) => r.render('musteriler',  { title: 'Müşteriler' }));
app.get('/calisanlar',  (_, r) => r.render('calisanlar',  { title: 'Çalışanlar' }));
app.get('/calisanedit', (_, r) => r.render('calisanedit', { title: 'Çalışan Düzenle' }));
app.get('/musduzenle', (_, res) => res.render('musduzenle', { title: 'Müşteri Düzenle' }));
app.get('/arizaekle', (_, res) => res.render('arizaekle', { title: 'Arıza Ekle' }));

app.listen(PORT, () => console.log(`→ http://localhost:${PORT}`));


// Hesap Özeti Sayfa Görünümü
app.get('/hesap', (req, res) => {
    res.render('hesap', { title: 'Hesap Özeti' });
});

// Hesap Verisi Çekme API’si
app.get('/api/hesap', (req, res) => {
    const { customerId } = req.query;
    if (!customerId) {
        return res.status(400).json({ error: 'customerId gerekli' });
    }
    const sql = `
    SELECT
      hesap,
      borc,
      DATE_FORMAT(hesapguncellenme, '%d.%m.%Y %H:%i') AS hesapguncellenme
    FROM customers
    WHERE id = ?
  `;
    pool.query(sql, [customerId], (err, rows) => {
        if (err) {
            console.error('API /api/hesap error:', err);
            return res.status(500).json({ error: err.message });
        }
        // Eğer hiçbir kayıt yoksa boş döner
        res.json(rows[0] || { hesap: '', borc: 0, hesapguncellenme: '' });
    });
});

// Hesap Güncelleme API’si
app.post('/api/hesap/update', (req, res) => {
    const { customerId, hesap, borc } = req.body;
    if (!customerId) {
        return res.status(400).json({ error: 'customerId gerekli' });
    }
    const sql = `
    UPDATE customers
      SET hesap = ?,
          borc  = ?,
          hesapguncellenme = NOW()
    WHERE id = ?
  `;
    pool.query(sql, [hesap, borc, customerId], err => {
        if (err) {
            console.error('API /api/hesap/update error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ ok: true });
    });
});
