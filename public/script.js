/* public/script.js – tüm sayfaları yöneten versiyon */

const qs = sel => document.querySelector(sel);

/* ---- Ortak: tarih formatı ---- */
const fmt = str => {
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

/* ---- Ortak: sıralama ---- */
function sortAttach(tableId, data, render) {
    document.querySelectorAll(`#${tableId} th[data-key]`).forEach(th => {
        let asc = true;
        const key = th.dataset.key;
        const label = th.innerText;

        th.style.cursor = 'pointer';
        th.onclick = () => {
            data.sort((a, b) => {
                let va = a[key], vb = b[key];
                if (key.includes("tarih") || key.includes("bakim") || key.includes("son")) {
                    va = new Date(va); vb = new Date(vb);
                }
                return (va < vb ? -1 : va > vb ? 1 : 0) * (asc ? 1 : -1);
            });
            asc = !asc;

            document.querySelectorAll(`#${tableId} th[data-key]`).forEach(h => h.innerText = h.innerText.replace(/ ▲| ▼/, ''));
            th.innerText = label + (asc ? ' ▲' : ' ▼');

            render(data);
        };
    });
}

/* ---- Sayfa: Bakım Listesi ---- */
async function loadBakim() {
    const t = qs('#bakimTable'), body = qs('#bakimTableBody'), load = qs('.loading');
    const data = await fetch('/api/bakimlarAll').then(r => r.json());
    load.style.display = 'none'; t.style.display = 'table';

    const render = (list) => {
        body.innerHTML = '';
        list.forEach(r => {
            body.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.customer}</td>
          <td>${fmt(r.sonbakim)}</td>
          <td>${r.bakimbilgi}</td>
          <td>${r.calisan}</td>
          <td>${r.cl}</td>
          <td>${r.ph}</td>
        </tr>
      `);
        });
    };

    render(data);
    sortAttach('bakimTable', data, render);
}

/* ---- Sayfa: Müşteri Listesi ---- */
async function loadMusteriler() {
    const t = qs('#musterilerTable'), body = qs('#musterilerTableBody'), load = qs('.loading');
    const data = await fetch('/api/musteriler').then(r => r.json());
    load.style.display = 'none'; t.style.display = 'table';

    const render = (list) => {
        body.innerHTML = '';
        list.forEach(r => {
            body.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.ad}</td>
          <td>${r.borc}</td>
          <td>${r.sonkontrol}</td>
          <td>${r.numara || '-'}</td>
        </tr>
      `);
        });
    };

    render(data);
    sortAttach('musterilerTable', data, render);
}

/* ---- Sayfa: Bakım Düzenle ---- */
async function loadBakimEdit() {
    const sel = qs('#customerSelect');
    const section = qs('#bakimEditSection');
    if (!sel || !section) return;

    const cust = await fetch('/api/musteriler').then(r => r.json());
    sel.innerHTML = '<option value="">-- Seçin --</option>';
    cust.forEach(c => sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.ad}</option>`));

    let rec = null;
    sel.onchange = async function () {
        const id = this.value;
        if (!id) return section.style.display = 'none';
        const list = await fetch(`/api/bakimlar?customerId=${id}`).then(r => r.json());
        if (!list.length) return alert("Kayıt bulunamadı");
        rec = list[0];
        section.style.display = 'block';
        fillEditForm(rec);
    };

    function fillEditForm(r) {
        qs('#clValue').value = r.cl;
        qs('#phValue').value = r.ph;
        qs('#bakimAciklamasi').value = r.bakimbilgi;
        qs('#tarihSaat').value = fmt(r.sonbakim);
        qs('#calisanValue').value = r.calisan;
        if (r.bakimfoto) {
            qs('#bakimFoto').src = r.bakimfoto;
            qs('#bakimFoto').style.display = 'block';
            qs('#bakimFotoPlaceholder').style.display = 'none';
        } else {
            qs('#bakimFoto').style.display = 'none';
            qs('#bakimFotoPlaceholder').style.display = 'block';
        }
    }

    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.onclick = async () => {
            if (!rec) return;
            const field = btn.dataset.field;
            const current = (field === 'bakimbilgi')
                ? qs('#bakimAciklamasi').value
                : (qs(`#${field}Value`)?.value || '');

            const nv = prompt("Yeni değer:", current);
            if (!nv || nv === current) return;

            await fetch('/api/bakim/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rec.id, field, value: nv })
            });

            rec[field] = nv;
            fillEditForm(rec);
            alert("Güncellendi");
        };
    });
}

/* ---- Sayfa: Çalışanlar (zaten çalışıyordu) ---- */
async function loadCalisanlar() {
    const t = qs('#calisanTable'), body = qs('#calisanBody'), load = qs('.loading');
    const data = await fetch('/api/calisanlar').then(r => r.json());
    load.style.display = 'none'; t.style.display = 'table';

    const render = (list) => {
        body.innerHTML = '';
        list.forEach(r => {
            body.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${r.ad}</td>
          <td>${r.ilk_bakim ? fmt(r.ilk_bakim) : '-'}</td>
          <td>${r.son_bakim ? fmt(r.son_bakim) : '-'}</td>
          <td>${r.toplam_bakim}</td>
          <td>${r.konum || '-'}</td>
        </tr>
      `);
        });
    };

    render(data);
    sortAttach('calisanTable', data, render);
}

/* ---- Router güncelle ---- */
document.addEventListener('DOMContentLoaded',()=>{
    if(qs('#arizaTable'))       return loadAriza();
    if(qs('#bakimTable'))       return loadBakim();
    if(qs('#musterilerTable'))  return loadMusteriler();
    if(qs('#bakimEditSection')) return loadBakimEdit();
    if(qs('#calisanTable'))     return loadCalisanlar();
    if(qs('#calisanAddBtn'))    return initCalisanEdit();
});

/* ÇALIŞAN DÜZENLE SAYFASI */
async function initCalisanEdit(){
    const addBtn = document.getElementById('calisanAddBtn');
    const delBtn = document.getElementById('calisanDelBtn');
    const selDel = document.getElementById('delSelect');
    if(!addBtn || !selDel) return;

    async function refreshDelList(){
        const list = await fetch('/api/calisanlar').then(r=>r.json());
        selDel.innerHTML='<option value="">-- Seçin --</option>';
        list.forEach(c=> selDel.insertAdjacentHTML('beforeend',`<option value="${c.id}">${c.ad}</option>`));
    }
    await refreshDelList();

    addBtn.onclick = async ()=>{
        const body = {
            ad:    document.getElementById('addAd').value.trim(),
            plaka: document.getElementById('addPlaka').value.trim(),
            yetki: document.getElementById('addYetki').value,
            sifre: document.getElementById('addSifre').value
        };
        if(!body.ad || !body.sifre) return alert("Ad ve şifre zorunlu!");
        const r = await fetch('/api/calisanlar/add',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(body)
        });
        if(r.ok){ alert("Eklendi"); document.querySelectorAll('#addAd,#addPlaka,#addSifre').forEach(i=>i.value=''); refreshDelList(); }
        else alert("Hata!");
    };

    delBtn.onclick = async ()=>{
        const id = selDel.value;
        if(!id) return alert("Seçim yapın");
        if(!confirm("Bu çalışan silinsin mi?")) return;
        const r = await fetch('/api/calisanlar/delete',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({id})
        });
        if(r.ok){ alert("Silindi"); refreshDelList(); }
        else alert("Hata!");
    };
}

/* Router ekle */
document.addEventListener('DOMContentLoaded',()=>{
    if(document.getElementById('calisanAddBtn')) return initCalisanEdit();
    /* diğer sayfa yükleyicileriniz burada kalır (loadBakim, loadMusteriler, ...) */
});

/* ---- Arıza Listesi ---- */
async function loadAriza(){
    const t=qs('#arizaTable'), body=qs('#arizaBody'), load=qs('.loading');
    const data = await fetch('/api/arizalar').then(r=>r.json());
    load.style.display='none'; t.style.display='table';

    const render = list=>{
        body.innerHTML='';
        list.forEach(r=>{
            body.insertAdjacentHTML('beforeend',`
        <tr>
          <td>${r.musteri}</td>
          <td>${r.konu}</td>
          <td>${r.aciklama}</td>
          <td>${r.medya ? `<a href="${r.medya}" target="_blank">Göster</a>` : '-'}</td>
          <td>${fmt(r.tarih)}</td>
        </tr>`);
        });
    };
    render(data); sortAttach('arizaTable',data,render);
}

/* ---- Arıza Ekle Sayfası ---- */
async function initArizaEkle(){
    const form = document.getElementById('arizaForm');
    const musteriSelect = document.getElementById('arizaMusteri');
    if (!form || !musteriSelect) return;

    // Müşteri listesini yükle
    const musteriler = await fetch('/api/musteriler').then(r => r.json());
    musteriler.forEach(m => {
        musteriSelect.insertAdjacentHTML('beforeend', `<option value="${m.id}">${m.ad}</option>`);
    });

    // Form gönderimi
    form.onsubmit = async (e) => {
        e.preventDefault();
        const body = {
            customerId: musteriSelect.value,
            konu:       document.getElementById('arizaKonu').value.trim(),
            aciklama:   document.getElementById('arizaAciklama').value.trim(),
            medya:      document.getElementById('arizaMedya').value.trim()
        };
        if (!body.customerId || !body.konu || !body.aciklama) return alert("Tüm zorunlu alanları doldurun!");

        const r = await fetch('/api/arizalar/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (r.ok) {
            alert('Arıza başarıyla kaydedildi!');
            form.reset();
        } else {
            alert('Hata oluştu!');
        }
    };
}

/* ---- Router ---- */
document.addEventListener('DOMContentLoaded',()=>{
    if(qs('#arizaTable'))       return loadAriza();
    if(qs('#bakimTable'))        return loadBakim();
    if(qs('#musterilerTable'))   return loadMusteriler();
    if(qs('#bakimEditSection'))  return loadBakimEdit();
    if(qs('#calisanTable'))      return loadCalisanlar();
    if(qs('#calisanAddBtn'))     return initCalisanEdit();
    if(qs('#arizaForm'))         return initArizaEkle();   // << eklenen satır
});
