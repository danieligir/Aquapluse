// === AQUAPULSE SCRIPT.JS — VERSI LENGKAP ===
// Perbaikan: bug toggle sidebar, grafik analisis, warna marker per kategori,
// counter animasi, skeleton loader, export CSV, filter kategori repositori

// --- 1. CONFIG & GLOBAL VARIABLES ---
const apiURL = "https://api.obis.org/v3/occurrence?geometry=POLYGON((124.0%200.8%2C126.5%200.8%2C126.5%202.5%2C124.0%202.5%2C124.0%200.8))&size=2000";

let masterData = [];
let mapInstance = null;
let markerLayer = null;
let currentRadius = 4;
let activeCategory = 'all';

// --- Warna per kategori ---
const categoryColors = {
    "Pisces":        "#f97316",
    "Flora Laut":    "#22c55e",
    "Cnidaria":      "#ef4444",
    "Molusca":       "#a855f7",
    "Echinodermata": "#eab308",
    "Reptilia":      "#14b8a6",
    "Porifera":      "#ec4899",
    "Arthropoda":    "#3b82f6",
    "default":       "#00a8cc"
};

// --- DATABASE METADATA BIOTA ---
const biotaMetadata = {
    "Enhalus acoroides":                   { lokal: "Lamun Tropis",             kat: "Flora Laut" },
    "Thalassia hemprichii":                { lokal: "Lamun Dugong",             kat: "Flora Laut" },
    "Cymodocea rotundata":                 { lokal: "Lamun Jari",               kat: "Flora Laut" },
    "Halophila ovalis":                    { lokal: "Lamun Daun Bulat",         kat: "Flora Laut" },
    "Syringodium isoetifolium":            { lokal: "Lamun Mie",                kat: "Flora Laut" },
    "Halophila minor":                     { lokal: "Lamun Sendok Kecil",       kat: "Flora Laut" },
    "Halodule uninervis":                  { lokal: "Lamun Serabut",            kat: "Flora Laut" },
    "Halodule pinifolia":                  { lokal: "Lamun Jarum",              kat: "Flora Laut" },
    "Oceana serrulata":                    { lokal: "Lamun Gigi Gergaji",       kat: "Flora Laut" },
    "Thalassodendron ciliatum":            { lokal: "Lamun Kayu",               kat: "Flora Laut" },
    "Triaenodon obesus":                   { lokal: "Hiu Sirip Putih",          kat: "Pisces" },
    "Parapercis clathrata":                { lokal: "Ikan Pasir Loreng",        kat: "Pisces" },
    "Acanthochromis polyacanthus":         { lokal: "Ikan Betok Hitam",         kat: "Pisces" },
    "Scolopsis meridiana":                 { lokal: "Ikan Pasir Garis Kuning",  kat: "Pisces" },
    "Trimma tevegae":                      { lokal: "Ikan Gobi Biru",           kat: "Pisces" },
    "Manta alfredi":                       { lokal: "Pari Manta Karang",        kat: "Pisces" },
    "Pomacentrus moluccensis":             { lokal: "Ikan Betok Kuning",        kat: "Pisces" },
    "Chromis weberi":                      { lokal: "Ikan Betok Weber",         kat: "Pisces" },
    "Bodianus loxozonus":                  { lokal: "Ikan Nuri Loreng",         kat: "Pisces" },
    "Gymnothorax gracilicauda":            { lokal: "Belut Moray",              kat: "Pisces" },
    "Dascyllus trimaculatus":              { lokal: "Ikan Betok Tiga Titik",    kat: "Pisces" },
    "Chrysiptera cyanea":                  { lokal: "Ikan Betok Biru",          kat: "Pisces" },
    "Auxis thazard":                       { lokal: "Ikan Tongkol Lisong",      kat: "Pisces" },
    "Selar boops":                         { lokal: "Ikan Selar Mata Besar",    kat: "Pisces" },
    "Opistognathus":                       { lokal: "Ikan Mulut Besar",         kat: "Pisces" },
    "Amphiprion ocellaris":                { lokal: "Ikan Badut (Nemo)",        kat: "Pisces" },
    "Phyllidia varicosa":                  { lokal: "Siput Kelinci Laut",       kat: "Molusca" },
    "Phyllidiella pustulosa":              { lokal: "Siput Laut Bintil",        kat: "Molusca" },
    "Halgerda batangas":                   { lokal: "Siput Laut Batangas",      kat: "Molusca" },
    "Coryphellina lotos":                  { lokal: "Siput Laut Lotos",         kat: "Molusca" },
    "Costasiella usagi":                   { lokal: "Siput Laut Shaun",         kat: "Molusca" },
    "Dolabrifera dolabrifera":             { lokal: "Siput Kelinci Baji",       kat: "Molusca" },
    "Hypselodoris roo":                    { lokal: "Siput Laut Roo",           kat: "Molusca" },
    "Nembrotha kubaryana":                 { lokal: "Siput Laut Neon",          kat: "Molusca" },
    "Chromodoris annae":                   { lokal: "Siput Laut Anna",          kat: "Molusca" },
    "Elysia":                              { lokal: "Siput Laut Hijau",         kat: "Molusca" },
    "Doriprismatica atromarginata":        { lokal: "Siput Laut Pinggiran Hitam", kat: "Molusca" },
    "Jorunna rubescens":                   { lokal: "Siput Laut Jorunna",       kat: "Molusca" },
    "Tridacna squamosa":                   { lokal: "Kima Sisik",               kat: "Molusca" },
    "Tridacna maxima":                     { lokal: "Kima Kecil",               kat: "Molusca" },
    "Acropora turaki":                     { lokal: "Karang Meja Turaki",       kat: "Cnidaria" },
    "Acropora kirstyae":                   { lokal: "Karang Cabang Kirsty",     kat: "Cnidaria" },
    "Acropora donei":                      { lokal: "Karang Meja Lebar",        kat: "Cnidaria" },
    "Acropora acuminata":                  { lokal: "Karang Jari",              kat: "Cnidaria" },
    "Acropora muricata":                   { lokal: "Karang Tanduk Rusa",       kat: "Cnidaria" },
    "Acropora":                            { lokal: "Karang Meja",              kat: "Cnidaria" },
    "Galaxea":                             { lokal: "Karang Bintang",           kat: "Cnidaria" },
    "Pteroeides":                          { lokal: "Pena Laut",                kat: "Cnidaria" },
    "Cirrhipathes anguina":                { lokal: "Karang Cemara",            kat: "Cnidaria" },
    "Linckia laevigata":                   { lokal: "Bintang Laut Biru",        kat: "Echinodermata" },
    "Culcita novaeguineae":               { lokal: "Bintang Laut Bantal",      kat: "Echinodermata" },
    "Holothuria atra":                     { lokal: "Teripang Hitam",           kat: "Echinodermata" },
    "Holothuria edulis":                   { lokal: "Teripang Merah",           kat: "Echinodermata" },
    "Chelonia mydas":                      { lokal: "Penyu Hijau",              kat: "Reptilia" },
    "Laticauda colubrina":                 { lokal: "Ular Laut Berbisa",        kat: "Reptilia" },
    "Aaptos lobata":                       { lokal: "Spons Kerak",              kat: "Porifera" },
    "Haliclona (Flagellia) indonesiae":   { lokal: "Spons Indonesia",          kat: "Porifera" },
    "Ircinia colossa":                     { lokal: "Spons Kolosal",            kat: "Porifera" },
    "Odontodactylus scyllarus":            { lokal: "Udang Mantis Pelangi",     kat: "Arthropoda" },
    "Ocypode ceratophthalmus":             { lokal: "Kepiting Hantu",           kat: "Arthropoda" },
    "Austruca perplexa":                   { lokal: "Kepiting Biola",           kat: "Arthropoda" }
};

// --- 2. CORE SYSTEM ---
async function initSystem() {
    const statusEl = document.getElementById('connStatus');
    const cachedData = sessionStorage.getItem('aquaPulseData');

    if (cachedData) {
        masterData = JSON.parse(cachedData);
        if (statusEl) statusEl.innerHTML = "● Live (Cached)";
        hideLoading();
        runVisuals();
    } else {
        try {
            const response = await fetch(apiURL);
            const json = await response.json();
            masterData = json.results || [];
            masterData.sort((a, b) => {
                const getY = (o) => parseInt(o.date_year || (o.eventDate ? o.eventDate.substring(0,4) : 0)) || 0;
                return getY(b) - getY(a);
            });
            sessionStorage.setItem('aquaPulseData', JSON.stringify(masterData));
            if (statusEl) statusEl.innerHTML = "● Live Connection Active";
            hideLoading();
            runVisuals();
        } catch (e) {
            if (statusEl) statusEl.innerHTML = "● Koneksi Gagal";
            hideLoading();
            runVisuals();
        }
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => overlay.classList.add('hidden'), 400);
        setTimeout(() => overlay.remove(), 1000);
    }
}

function runVisuals() {
    if (document.getElementById('map'))          initMapSystem();
    if (document.getElementById('speciesTable')) renderTable();
    if (document.getElementById('heroCounter'))  animateHeroCounters();

    const countGlobal = document.getElementById('statCount');
    if (countGlobal) countGlobal.innerText = masterData.length.toLocaleString();
}

// --- 3. PETA ---
function initMapSystem() {
    if (!mapInstance) {
        mapInstance = L.map('map', { renderer: L.canvas() }).setView([1.55, 125.0], 9);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
        }).addTo(mapInstance);
        markerLayer = L.layerGroup().addTo(mapInstance);
        populateYearFilter();
        setupMapFilters();
        setupSidebarToggle();
        buildMapLegend();
    }
    drawMarkers(masterData);
}

function getCategoryColor(scientificName) {
    const meta = biotaMetadata[scientificName];
    if (!meta) return categoryColors["default"];
    return categoryColors[meta.kat] || categoryColors["default"];
}

function drawMarkers(data) {
    if (!markerLayer) return;
    markerLayer.clearLayers();
    data.forEach(d => {
        if (d.decimalLatitude && d.decimalLongitude) {
            const meta = biotaMetadata[d.scientificName] || { lokal: "Spesies Lokal", kat: "Invertebrata Laut" };
            const color = getCategoryColor(d.scientificName);
            L.circleMarker([d.decimalLatitude, d.decimalLongitude], {
                radius: parseInt(currentRadius),
                fillColor: color,
                color: '#fff',
                weight: 1,
                fillOpacity: 0.75
            }).addTo(markerLayer).bindPopup(`
                <div style="font-size:13px;line-height:1.6;min-width:180px;">
                    <b style="color:#004a99;font-size:14px;">${d.scientificName}</b>
                    <hr style="margin:5px 0;border-color:#f1f5f9;">
                    <b>Nama Lokal:</b> ${meta.lokal}<br>
                    <b>Kategori:</b> <span style="background:${color};color:white;padding:1px 8px;border-radius:8px;font-size:11px;">${meta.kat}</span><br>
                    <b>Tahun:</b> ${d.date_year || 'N/A'}<br>
                    <b>Kedalaman:</b> ${d.depth ? d.depth+'m' : '-'}
                </div>
            `);
        }
    });
    // Update chart setelah markers berubah
    if (document.getElementById('chartBar')) renderAnalysisCharts(data);
}

function buildMapLegend() {
    const legendEl = document.getElementById('mapLegend');
    if (!legendEl) return;
    const cats = Object.entries(categoryColors).filter(([k]) => k !== 'default');
    legendEl.innerHTML = '<h4><i class="fas fa-circle-dot" style="font-size:10px;margin-right:4px;"></i>Kategori Spesies</h4>' +
        cats.map(([name, color]) =>
            `<div class="legend-item">
                <span class="legend-dot" style="background:${color};"></span>
                <span>${name}</span>
             </div>`
        ).join('');
}

function setupMapFilters() {
    const searchInput  = document.getElementById('mapSearch');
    const yearSelect   = document.getElementById('filterYear');
    const radiusSlider = document.getElementById('radiusSlider');
    const radVal       = document.getElementById('radVal');

    const applyFilter = () => {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const year = yearSelect  ? yearSelect.value : 'all';
        currentRadius = radiusSlider ? radiusSlider.value : 4;
        if (radVal) radVal.innerText = currentRadius;

        const filtered = masterData.filter(item => {
            const scNameFull = (item.scientificName || "").toLowerCase();
            // Also try matching against known metadata keys (handles author suffixes)
            const metaKey = Object.keys(biotaMetadata).find(k =>
                scNameFull.startsWith(k.toLowerCase())
            );
            const locName = metaKey ? (biotaMetadata[metaKey]?.lokal || "").toLowerCase() : "";
            const katName = metaKey ? (biotaMetadata[metaKey]?.kat  || "").toLowerCase() : "";
            const itemYear = (item.date_year || (item.eventDate ? item.eventDate.substring(0,4) : "")).toString();

            const matchName = !term ||
                scNameFull.includes(term) ||
                locName.includes(term) ||
                katName.includes(term);
            const matchYear = year === 'all' || itemYear === year;
            return matchName && matchYear;
        });
        drawMarkers(filtered);
    };

    if (searchInput)  searchInput.addEventListener('input', applyFilter);
    if (yearSelect)   yearSelect.addEventListener('change', applyFilter);
    if (radiusSlider) radiusSlider.addEventListener('input', applyFilter);
}

// --- 4. GRAFIK ANALISIS ---
let barChartInstance = null;
let doughnutChartInstance = null;

function renderAnalysisCharts(data) {
    const barCanvas = document.getElementById('chartBar');
    const doughnutCanvas = document.getElementById('chartDoughnut');
    if (!barCanvas && !doughnutCanvas) return;

    // Hitung data
    const spMap = {}, catMap = {};
    (data || masterData).forEach(d => {
        spMap[d.scientificName] = (spMap[d.scientificName] || 0) + 1;
        const kat = biotaMetadata[d.scientificName]?.kat || "Lainnya";
        catMap[kat] = (catMap[kat] || 0) + 1;
    });

    // Bar chart — 5 spesies terbanyak
    if (barCanvas) {
        const top5 = Object.entries(spMap).sort((a,b) => b[1]-a[1]).slice(0,5);
        if (barChartInstance) barChartInstance.destroy();
        barChartInstance = new Chart(barCanvas, {
            type: 'bar',
            data: {
                labels: top5.map(s => s[0].length > 20 ? s[0].substring(0,18)+'…' : s[0]),
                datasets: [{
                    label: 'Jumlah Observasi',
                    data: top5.map(s => s[1]),
                    backgroundColor: top5.map(s => getCategoryColor(s[0])),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 20 } },
                    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
                }
            }
        });
    }

    // Doughnut chart — per kategori
    if (doughnutCanvas) {
        const catEntries = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
        if (doughnutChartInstance) doughnutChartInstance.destroy();
        doughnutChartInstance = new Chart(doughnutCanvas, {
            type: 'doughnut',
            data: {
                labels: catEntries.map(c => c[0]),
                datasets: [{
                    data: catEntries.map(c => c[1]),
                    backgroundColor: catEntries.map(c => categoryColors[c[0]] || categoryColors.default),
                    borderWidth: 2, borderColor: '#fff'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } }
                },
                cutout: '60%'
            }
        });
    }
}

// --- 5. TABEL REPOSITORI ---
let currentTableData = [];

function renderTable() {
    const tbody  = document.querySelector("#speciesTable tbody");
    const search = document.getElementById('universalSearch');
    if (!tbody) return;

    // Tampilkan skeleton dulu
    tbody.innerHTML = Array(8).fill('').map(() => `
        <tr>
            <td><div class="skeleton short"></div></td>
            <td><div class="skeleton medium"></div></td>
            <td><div class="skeleton short"></div></td>
            <td><div class="skeleton short"></div></td>
            <td><div class="skeleton short"></div></td>
        </tr>`).join('');

    setTimeout(() => {
        currentTableData = masterData;
        drawTable(masterData);
        updateRepoStats(masterData);
        buildCategoryFilters();
    }, 300);

    if (search) {
        search.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            const filtered = masterData.filter(item => {
                const n = (item.scientificName || "").toLowerCase();
                const l = (biotaMetadata[item.scientificName]?.lokal || "").toLowerCase();
                const k = (biotaMetadata[item.scientificName]?.kat  || "").toLowerCase();
                return n.includes(val) || l.includes(val) || k.includes(val);
            });
            currentTableData = filtered;
            drawTable(filtered);
            updateRepoStats(filtered);
        });
    }
}

function drawTable(list) {
    const tbody = document.querySelector("#speciesTable tbody");
    if (!tbody) return;

    const uniqueMap = new Map();
    list.forEach(item => { if (!uniqueMap.has(item.scientificName)) uniqueMap.set(item.scientificName, item); });
    const items = Array.from(uniqueMap.values()).slice(0, 150);

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">Tidak ada spesies yang ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map((d, i) => {
        const scName = d.scientificName || "Unknown";
        const meta = biotaMetadata[scName] || { lokal: "-", kat: "Invertebrata Laut" };
        const color = categoryColors[meta.kat] || categoryColors.default;
        return `<tr>
            <td style="color:#94a3b8;font-size:12px;">${i+1}</td>
            <td><i style="color:#334155;">${scName}</i></td>
            <td style="font-weight:600;color:#004a99;">${meta.lokal}</td>
            <td><span style="background:${color}20;color:${color};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${meta.kat}</span></td>
            <td style="color:#64748b;">${d.depth ? d.depth+'m' : '-'}</td>
        </tr>`;
    }).join('');
}

function updateRepoStats(data) {
    const uniqueSpecies = new Set(data.map(d => d.scientificName)).size;
    const uniqueCategories = new Set(data.map(d => biotaMetadata[d.scientificName]?.kat).filter(Boolean)).size;
    const years = data.map(d => parseInt(d.date_year)).filter(y => !isNaN(y));
    const yearRange = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '-';

    animateCounter('statSpecies',    0, uniqueSpecies, 600);
    animateCounter('statObs',        0, data.length,   700);
    animateCounter('statCategories', 0, uniqueCategories, 500);
    const yrEl = document.getElementById('statYears');
    if (yrEl) yrEl.innerText = yearRange;
}

function buildCategoryFilters() {
    const container = document.getElementById('catFilters');
    if (!container) return;
    const cats = [...new Set(Object.values(biotaMetadata).map(m => m.kat))].sort();
    container.innerHTML = `<button class="cat-btn active" onclick="filterByCategory('all',this)">Semua</button>` +
        cats.map(c => `<button class="cat-btn" onclick="filterByCategory('${c}',this)">${c}</button>`).join('');
}

function filterByCategory(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    activeCategory = cat;

    const filtered = cat === 'all' ? masterData :
        masterData.filter(item => biotaMetadata[item.scientificName]?.kat === cat);
    currentTableData = filtered;
    drawTable(filtered);
    updateRepoStats(filtered);
}

// Export CSV
function exportCSV() {
    const uniqueMap = new Map();
    currentTableData.forEach(item => { if (!uniqueMap.has(item.scientificName)) uniqueMap.set(item.scientificName, item); });
    const items = Array.from(uniqueMap.values()).slice(0, 150);

    const header = ['No', 'Nama Ilmiah', 'Nama Lokal', 'Kategori', 'Kedalaman (m)'];
    const rows = items.map((d, i) => {
        const meta = biotaMetadata[d.scientificName] || { lokal: '-', kat: 'Invertebrata Laut' };
        return [i+1, d.scientificName, meta.lokal, meta.kat, d.depth || '-'].join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'aquapulse_spesies.csv'; a.click();
    URL.revokeObjectURL(url);
}

// --- 6. HERO COUNTER ANIMASI ---
function animateHeroCounters() {
    if (!masterData.length) return;

    const uniqueSpecies = new Set(masterData.map(d => d.scientificName)).size;
    const totalObs = masterData.length;
    const years = masterData.map(d => parseInt(d.date_year)).filter(y => !isNaN(y));
    const yearRange = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;

    animateCounter('cntSpecies', 0, uniqueSpecies, 1200);
    animateCounter('cntObs',     0, totalObs,      1500);
    animateCounter('cntYears',   0, yearRange,     900);
}

function animateCounter(id, from, to, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.innerText = Math.floor(from + (to - from) * ease).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// --- 7. UTILS ---
function populateYearFilter() {
    const sel = document.getElementById('filterYear');
    if (!sel) return;
    // Hapus semua kecuali opsi pertama ("Semua Tahun")
    while (sel.options.length > 1) sel.remove(1);
    const years = [...new Set(
        masterData.map(d => d.date_year || (d.eventDate ? d.eventDate.substring(0,4) : null))
                  .filter(Boolean)
    )].sort((a,b) => b - a);
    years.forEach(yr => {
        const o = document.createElement('option');
        o.value = yr; o.innerText = yr; sel.appendChild(o);
    });
}

// PERBAIKAN BUG: Toggle sidebar — tombol berada di LUAR elemen sidebar
function setupSidebarToggle() {
    const btn     = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;

    btn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // Update icon
        const icon = btn.querySelector('i');
        if (icon) {
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-right';
                btn.style.left = '0';
            } else {
                icon.className = 'fas fa-chevron-left';
                btn.style.left = '320px';
            }
        }
    });
}

// Mobile sidebar toggle
function setupMobileSidebarToggle() {
    const btn     = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        btn.innerHTML = sidebar.classList.contains('collapsed')
            ? '<i class="fas fa-sliders-h"></i> Tampilkan Filter'
            : '<i class="fas fa-times"></i> Sembunyikan Filter';
    });
}

// --- 8. MOBILE HAMBURGER NAVBAR ---
function setupHamburger() {
    const ham    = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (!ham || !mobileNav) return;
    ham.addEventListener('click', () => {
        ham.classList.toggle('open');
        mobileNav.classList.toggle('open');
    });
    // Tutup saat klik link
    mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            ham.classList.remove('open');
            mobileNav.classList.remove('open');
        });
    });
}

// --- INIT ---
window.onload = () => {
    setupHamburger();
    setupMobileSidebarToggle();
    initSystem();
};