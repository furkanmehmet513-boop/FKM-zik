// app.js
/**
 * FK Küçült - Uygulama Başlatıcı
 * Application initialization and event wiring
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM Referansları ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('overlay');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const homeCards = document.querySelectorAll('.home-card');

    // === Sidebar Toggle ===
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // === Overlay Tıklaması ===
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeSidebar();
        });
    }

    // === Sidebar Menü Öğeleri ===
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-nav');
            if (viewName) {
                switchView(viewName);
                // Görünüm init fonksiyonunu gecikmeli çağır
                scheduleViewInit(viewName);
            }
            closeSidebar();
        });
    });

    // === Ana Sayfa Kartları ===
    homeCards.forEach(card => {
        card.addEventListener('click', () => {
            const viewName = card.getAttribute('data-nav');
            if (viewName) {
                switchView(viewName);
                scheduleViewInit(viewName);
            }
        });
    });

    // === Klavye Kısayolu: Escape ile sidebar kapat ===
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        }
    });

    // === Dokunmatik cihazlarda sidebar dışına swipe ===
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const sidebar = document.getElementById('sidebar');
        // Sağdan sola 50px'den fazla swipe varsa sidebar'ı kapat
        if (diff > 50 && sidebar && sidebar.classList.contains('open') && touchStartX < 320) {
            closeSidebar();
        }
    });

    // === Pencere boyutu değiştiğinde sidebar durumunu yönet ===
    window.addEventListener('resize', () => {
        // Masaüstü genişliğe geçişte sidebar'ı kapat (temiz durum)
        // İsteğe bağlı: masaüstünde sidebar açık kalsın
    });

    /**
     * Görünüm başlatma fonksiyonunu gecikmeli olarak çağırır
     * @param {string} viewName - Başlatılacak görünüm
     */
    function scheduleViewInit(viewName) {
        // DOM'un hazır olması için hafif gecikme
        setTimeout(() => {
            switch (viewName) {
                case 'pdf':
                    if (typeof initPdfCompress === 'function') {
                        initPdfCompress();
                    }
                    break;
                case 'single-image':
                    if (typeof initSingleImage === 'function') {
                        initSingleImage();
                    }
                    break;
                case 'multiple-images':
                    if (typeof initMultipleImages === 'function') {
                        initMultipleImages();
                    }
                    break;
                case 'home':
                default:
                    // Ana sayfa için init gerekmez
                    break;
            }
        }, 100);
    }

    // === Uygulama başlangıç durumu ===
    // Ana sayfa varsayılan olarak açık
    switchView('home');

    // İlk yüklemede tüm tool view'ları önceden init et (isteğe bağlı)
    // Böylece ilk geçişte gecikme olmaz
    setTimeout(() => {
        if (typeof initPdfCompress === 'function') initPdfCompress();
        if (typeof initSingleImage === 'function') initSingleImage();
        if (typeof initMultipleImages === 'function') initMultipleImages();
    }, 200);

    console.log('FK Küçült başlatıldı. Tüm işlemler cihazınızda yapılır, sunucuya veri gönderilmez.');
});