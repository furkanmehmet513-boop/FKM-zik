// utils.js
/**
 * FK Küçült - Yardımcı Fonksiyonlar
 * Utility functions: toast notifications, file size formatting, file extension, unique ID
 */

/**
 * Toast bildirimi gösterir
 * @param {string} msg - Gösterilecek mesaj
 * @param {'success'|'error'|'info'} [type='info'] - Toast tipi
 * @param {number} [duration=3500] - Gösterim süresi (ms)
 */
function showToast(msg, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${msg}</span>`;
    container.appendChild(toast);

    const remove = () => {
        if (toast.parentNode) {
            toast.classList.add('toast-removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    };

    setTimeout(remove, duration);

    // Tıklayınca da kapanabilsin
    toast.addEventListener('click', remove);
}

/**
 * Bayt değerini insan tarafından okunabilir formata çevirir
 * @param {number} bytes - Bayt cinsinden boyut
 * @param {number} [decimals=2] - Ondalık basamak sayısı
 * @returns {string} Biçimlendirilmiş boyut (örn: "1.5 MB")
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0 || bytes === null || bytes === undefined) return '0 Bayt';
    if (bytes < 0) return '0 Bayt';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bayt', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const index = Math.min(i, sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
}

/**
 * Dosya adından uzantıyı döndürür
 * @param {string} filename - Dosya adı
 * @returns {string} Küçük harf olarak dosya uzantısı (örn: "pdf", "jpg")
 */
function getFileExtension(filename) {
    if (!filename || typeof filename !== 'string') return '';
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1].toLowerCase();
}

/**
 * Benzersiz bir ID oluşturur
 * @returns {string} Rastgele benzersiz kimlik
 */
function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}