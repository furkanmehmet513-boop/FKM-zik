// ui.js
/**
 * FK Küçült - UI Yönetimi
 * UI management: view switching, sidebar, file info, results, button states
 */

/** Şu anki aktif görünüm */
let currentView = 'home';

/** Hangi görünümlerin init edildiğini takip eder */
const initializedViews = new Set();

/**
 * Görünümler arasında geçiş yapar
 * @param {string} viewName - Geçiş yapılacak görünüm adı ('home', 'pdf', 'single-image', 'multiple-images')
 */
function switchView(viewName) {
    // Tüm görünümleri gizle
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));

    // Hedef görünümü göster
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Sidebar aktif öğesini güncelle
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-nav') === viewName) {
            item.classList.add('active');
        }
    });

    // Header başlığını güncelle
    const headerTitle = document.getElementById('headerTitle');
    const titles = {
        'home': 'Ana Sayfa',
        'pdf': 'PDF Küçült',
        'single-image': 'Tekli Fotoğraf Küçült',
        'multiple-images': 'Çoklu Fotoğraf Küçült'
    };
    if (headerTitle) {
        headerTitle.textContent = titles[viewName] || 'FK Küçült';
    }

    currentView = viewName;

    // Sidebar'ı kapat
    closeSidebar();
}

/**
 * Sidebar'ı açar
 */
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
}

/**
 * Sidebar'ı kapatır
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Dosya bilgisi satırını gösterir
 * @param {string} infoId - Bilgi container'ının ID'si
 * @param {string} name - Dosya adı
 * @param {number} size - Dosya boyutu (bayt)
 */
function showFileInfo(infoId, name, size) {
    const container = document.getElementById(infoId);
    if (!container) return;

    container.style.display = 'flex';
    container.innerHTML = `
        <span class="file-info-name" title="${name}">${name}</span>
        <span class="file-info-size">${formatBytes(size)}</span>
    `;
}

/**
 * Dosya bilgisi container'ını gizler
 * @param {string} infoId - Bilgi container'ının ID'si
 */
function hideFileInfo(infoId) {
    const container = document.getElementById(infoId);
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

/**
 * Sıkıştırma sonucunu gösterir
 * @param {string} resultId - Sonuç container'ının ID'si
 * @param {number} originalSize - Orijinal boyut (bayt)
 * @param {number} compressedSize - Sıkıştırılmış boyut (bayt)
 * @param {Function} downloadCallback - İndirme butonuna tıklandığında çağrılacak fonksiyon
 */
function showResult(resultId, originalSize, compressedSize, downloadCallback) {
    const container = document.getElementById(resultId);
    if (!container) return;

    const reduction = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100) : 0;
    const reductionFormatted = reduction.toFixed(1);

    container.style.display = 'block';
    container.innerHTML = `
        <div class="result-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Küçültme Tamamlandı!
        </div>
        <div class="result-stats">
            <div class="result-stat">
                <div class="result-stat-label">Orijinal Boyut</div>
                <div class="result-stat-value">${formatBytes(originalSize)}</div>
            </div>
            <div class="result-stat">
                <div class="result-stat-label">Küçültülmüş Boyut</div>
                <div class="result-stat-value">${formatBytes(compressedSize)}</div>
            </div>
            <div class="result-stat">
                <div class="result-stat-label">Küçülme Oranı</div>
                <div class="result-stat-value result-stat-highlight">%${reductionFormatted}</div>
            </div>
        </div>
        <button class="btn btn-download result-download-btn" id="${resultId}-download-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            İndir
        </button>
    `;

    // İndirme butonuna event listener ekle
    const downloadBtn = document.getElementById(`${resultId}-download-btn`);
    if (downloadBtn && typeof downloadCallback === 'function') {
        downloadBtn.addEventListener('click', downloadCallback);
    }
}

/**
 * Sonuç container'ını gizler
 * @param {string} resultId - Sonuç container'ının ID'si
 */
function hideResult(resultId) {
    const container = document.getElementById(resultId);
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

/**
 * Butonun yüklenme durumunu ayarlar
 * @param {HTMLElement} btn - Buton elementi
 * @param {boolean} loading - Yükleniyor mu?
 */
function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}