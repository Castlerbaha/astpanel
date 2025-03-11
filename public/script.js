// public/script.js

// Navbar submenu toggle
document.addEventListener("DOMContentLoaded", function() {
    const bakimMenu = document.getElementById("bakim-menu");
    if (bakimMenu) {
        bakimMenu.addEventListener("click", function() {
            this.classList.toggle("active");
        });
    }
    const musterilerMenu = document.getElementById("musteriler-menu");
    if (musterilerMenu) {
        musterilerMenu.addEventListener("click", function() {
            this.classList.toggle("active");
        });
    }
});

// Format date as "HH:mm - DD.MM.YYYY"
function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} - ${day}.${month}.${year}`;
}

// Modal functions
function showModal(src) {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("modalImage");
    if (modal && modalImg) {
        modalImg.src = src;
        modal.style.display = "block";
    }
}

function closeModal() {
    const modal = document.getElementById("photoModal");
    if (modal) modal.style.display = "none";
}

const modalClose = document.getElementById("modalClose");
if (modalClose) {
    modalClose.addEventListener("click", closeModal);
}
window.addEventListener("click", function(event) {
    const modal = document.getElementById("photoModal");
    if (modal && event.target === modal) {
        modal.style.display = "none";
    }
});

// For Bakım page: render and sorting functionality
function renderBakimTable(data) {
    const tableBody = document.getElementById("bakimTableBody");
    tableBody.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${item.ad}</td>
      <td>${formatDate(item.sonbakim)}</td>
      <td>${item.bakimbilgi}</td>
      <td>${item.calisan}</td>
      <td>${item.bakimfoto ? `<span class="bakimfoto-link" data-src="${item.bakimfoto}">Fotoğrafı Gör</span>` : "Yok"}</td>
      <td>${item.cl}</td>
      <td>${item.ph}</td>
    `;
        tableBody.appendChild(row);
    });
    document.querySelectorAll(".bakimfoto-link").forEach(link => {
        link.addEventListener("click", function() {
            const src = this.getAttribute("data-src");
            showModal(src);
        });
    });
}

// Sorting functionality for Bakım page
let bakimSortOrders = {};

function sortBakimData(key, data) {
    // Toggle sort order
    bakimSortOrders[key] = bakimSortOrders[key] === "asc" ? "desc" : "asc";

    // Reset header text with no arrow
    document.querySelectorAll("th[data-key]").forEach(header => {
        let baseText = header.getAttribute("data-base");
        if (!baseText) {
            baseText = header.innerText;
            header.setAttribute("data-base", baseText);
        }
        header.innerText = baseText;
    });

    // Append arrow to clicked header
    const header = document.querySelector(`th[data-key="${key}"]`);
    if (header) {
        header.innerText = header.getAttribute("data-base") + (bakimSortOrders[key] === "asc" ? " ▲" : " ▼");
    }

    data.sort((a, b) => {
        let valA = a[key], valB = b[key];
        if (key === "sonbakim") {
            valA = new Date(valA);
            valB = new Date(valB);
        }
        if (valA < valB) return bakimSortOrders[key] === "asc" ? -1 : 1;
        if (valA > valB) return bakimSortOrders[key] === "asc" ? 1 : -1;
        return 0;
    });

    renderBakimTable(data);
}

// For Musteriler page: render functionality
function renderMusterilerTable(data) {
    const tableBody = document.getElementById("musterilerTableBody");
    tableBody.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${item.ad}</td>
      <td>${item.borc}</td>
      <td>${item.sonkontrol}</td>
      <td>${item.numara || "Yok"}</td>
    `;
        tableBody.appendChild(row);
    });
}

// Sorting functionality for Musteriler page
let musteriSortOrders = {};

function sortMusterilerData(key, data) {
    musteriSortOrders[key] = musteriSortOrders[key] === "asc" ? "desc" : "asc";

    // Reset header text with no arrow
    document.querySelectorAll("#musterilerTable th[data-key]").forEach(header => {
        let baseText = header.getAttribute("data-base");
        if (!baseText) {
            baseText = header.innerText;
            header.setAttribute("data-base", baseText);
        }
        header.innerText = baseText;
    });

    // Append arrow to clicked header
    const header = document.querySelector(`#musterilerTable th[data-key="${key}"]`);
    if (header) {
        header.innerText = header.getAttribute("data-base") + (musteriSortOrders[key] === "asc" ? " ▲" : " ▼");
    }

    data.sort((a, b) => {
        let valA = a[key], valB = b[key];
        if (valA < valB) return musteriSortOrders[key] === "asc" ? -1 : 1;
        if (valA > valB) return musteriSortOrders[key] === "asc" ? 1 : -1;
        return 0;
    });

    renderMusterilerTable(data);
}

// On page load, determine which page is loaded and fetch data accordingly
document.addEventListener("DOMContentLoaded", async function() {
    if (document.getElementById("bakimTable")) {
        try {
            const response = await fetch("/api/bakimlar");
            if (!response.ok) throw new Error("Error fetching bakim data");
            const data = await response.json();
            document.querySelector(".loading").style.display = "none";
            document.getElementById("bakimTable").style.display = "table";
            renderBakimTable(data);
        } catch (error) {
            console.error(error);
        }
    }

    if (document.getElementById("musterilerTable")) {
        try {
            const response = await fetch("/api/musteriler");
            if (!response.ok) throw new Error("Error fetching musteriler data");
            const data = await response.json();
            document.querySelector(".loading").style.display = "none";
            document.getElementById("musterilerTable").style.display = "table";
            renderMusterilerTable(data);
        } catch (error) {
            console.error(error);
        }
    }
});
