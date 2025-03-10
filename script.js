// script.js

// Navbar submenu toggle
document.addEventListener("DOMContentLoaded", function() {
    const bakimMenu = document.getElementById('bakim-menu');
    if (bakimMenu) {
        bakimMenu.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
    const musterilerMenu = document.getElementById('musteriler-menu');
    if (musterilerMenu) {
        musterilerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
});

// Format date as "Saat & Gün.Ay"
function formatTurkishDate(datetimeStr) {
    const parts = datetimeStr.split(" ");
    if (parts.length < 2) return datetimeStr;
    const timePart = parts[1];
    const datePart = parts[0];
    const dateComponents = datePart.split("-");
    if (dateComponents.length < 3) return datetimeStr;
    const [year, month, day] = dateComponents;
    return timePart + " & " + day + "." + month;
}

// Modal functions (for bakim.html)
function showModal(src) {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modalImg.src = src;
        modal.style.display = "block";
    }
}
function closeModal() {
    const modal = document.getElementById('photoModal');
    if (modal) modal.style.display = "none";
}
const modalClose = document.getElementById('modalClose');
if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}
window.addEventListener('click', function(event) {
    const modal = document.getElementById('photoModal');
    if (modal && event.target === modal) {
        modal.style.display = "none";
    }
});

// Render and sort functions for Bakım page
function renderBakimTable(data) {
    const tableBody = document.getElementById('bakimTableBody');
    tableBody.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${item.ad}</td>
      <td>${formatTurkishDate(item.sonbakim)}</td>
      <td>${item.bakimbilgi}</td>
      <td>${item.bakimfoto ? `<span class="bakimfoto-link" data-src="${item.bakimfoto}">Fotoğrafı Gör</span>` : 'Yok'}</td>
      <td>${item.cl}</td>
      <td>${item.ph}</td>
    `;
        tableBody.appendChild(row);
    });
    document.querySelectorAll('.bakimfoto-link').forEach(link => {
        link.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            showModal(src);
        });
    });
}
function sortBakimData(key, data) {
    return data.sort((a, b) => {
        if(a[key] < b[key]) return -1;
        if(a[key] > b[key]) return 1;
        return 0;
    });
}

// Render function for Müşteri page
function renderMusterilerTable(data) {
    const tableBody = document.getElementById('musterilerTableBody');
    tableBody.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${item.ad}</td>
      <td>${item.borc}</td>
      <td>${item.sonkontrol}</td>
      <td>${item.numara || 'Yok'}</td>
    `;
        tableBody.appendChild(row);
    });
}
function sortMusterilerData(key, data) {
    return data.sort((a, b) => {
        if(a[key] < b[key]) return -1;
        if(a[key] > b[key]) return 1;
        return 0;
    });
}

// On page load, fetch data according to the page
document.addEventListener("DOMContentLoaded", async function() {
    // Bakım Listesi sayfası
    if (document.getElementById('bakimTable')) {
        try {
            const response = await fetch('/api/bakimlar');
            if (!response.ok) throw new Error("Error fetching bakim data");
            const bakimData = await response.json();
            document.querySelector('.loading').style.display = "none";
            document.getElementById('bakimTable').style.display = "table";
            renderBakimTable(bakimData);
        } catch (error) {
            console.error(error);
        }
    }

    // Müşteri Listesi sayfası
    if (document.getElementById('musterilerTable')) {
        try {
            const response = await fetch('/api/musteriler');
            if (!response.ok) throw new Error("Error fetching musteriler data");
            const musteriData = await response.json();
            document.querySelector('.loading').style.display = "none";
            document.getElementById('musterilerTable').style.display = "table";
            renderMusterilerTable(musteriData);
        } catch (error) {
            console.error(error);
        }
    }
});
