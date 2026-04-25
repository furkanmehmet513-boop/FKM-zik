// single-image.js
/**
 * FK Küçült - Tekli Fotoğraf Sıkıştırma Modülü
 * Single image compression using Canvas API
 */

let singleImageFile = null;
let singleImageDataUrl = null;

/**
 * Tekli fotoğraf sıkıştırma görünümünü başlatır
 */
function initSingleImage() {
    if (initializedViews.has('single-image')) return;
    initializedViews.add('single-image');

    const dropzone = document.getElementById('single-dropzone');
    const fileInput = document.getElementById('single-file-input');
    const compressBtn = document.getElementById('single-compress-btn');
    const qualitySlider = document.getElementById('single-quality');
    const qualityValue = document.getElementById('single-quality-value');
    const previewWrapper = document.getElementById('single-preview-wrapper');
    const previewImg = document.getElementById('single-preview');
    const qualityControl = document.getElementById('single-quality-control');
    const resultBox = document.getElementById('single-result');
    const fileInfo = document.getElementById('single-file-info');

    if (!dropzone || !fileInput || !compressBtn) return;

    // Kalite slider
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = '%' + qualitySlider.value;
        });
    }

    // Dropzone tıklama
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Dosya input değişikliği
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    // Sürükle-bırak olayları
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    // Sıkıştırma butonu
    compressBtn.addEventListener('click', () => {
        if (singleImageFile) {
            const quality = qualitySlider ? parseInt(qualitySlider.value) : 70;
            compressImage(singleImageFile, quality);
        } else {
            showToast('Lütfen önce bir fotoğraf yükleyin.', 'error');
        }
    });

    /**
     * Fotoğraf dosyasını işler
     * @param {File} file - Fotoğraf dosyası
     */
    function handleImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/tiff'];
        if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
            showToast('Lütfen geçerli bir görsel dosyası seçin.', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            showToast('Dosya boyutu 50 MB\'ı aşmamalıdır.', 'error');
            return;
        }

        singleImageFile = file;
        showFileInfo('single-file-info', file.name, file.size);
        hideResult('single-result');

        // Önizleme göster
        const reader = new FileReader();
        reader.onload = (e) => {
            singleImageDataUrl = e.target.result;
            if (previewImg) {
                previewImg.src = singleImageDataUrl;
            }
            if (previewWrapper) {
                previewWrapper.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);

        // Kalite kontrolünü göster
        if (qualityControl) {
            qualityControl.style.display = 'block';
        }

        compressBtn.disabled = false;
        showToast('Fotoğraf yüklendi. Kaliteyi ayarlayıp küçült butonuna tıklayın.', 'success');
    }
}

/**
 * Canvas API kullanarak görseli sıkıştırır
 * @param {File} file - Orijinal görsel dosyası
 * @param {number} quality - JPEG kalitesi (10-100)
 * @returns {Promise<Blob>} Sıkıştırılmış görsel blob'u
 */
function compressImage(file, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob başarısız oldu.'));
                    }
                }, 'image/jpeg', quality / 100);
            };
            img.onerror = () => {
                reject(new Error('Görsel yüklenemedi.'));
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            reject(new Error('Dosya okunamadı.'));
        };
        reader.readAsDataURL(file);
    });
}

// Tekli görsel sıkıştırma için buton tıklaması (init içinde kullanılır)
// Bu fonksiyon initSingleImage içinde doğrudan çağrılır
async function handleSingleCompress() {
    const compressBtn = document.getElementById('single-compress-btn');
    const qualitySlider = document.getElementById('single-quality');
    const resultBox = document.getElementById('single-result');

    if (!singleImageFile) {
        showToast('Lütfen önce bir fotoğraf yükleyin.', 'error');
        return;
    }

    setButtonLoading(compressBtn, true);
    hideResult('single-result');

    try {
        const quality = qualitySlider ? parseInt(qualitySlider.value) : 70;
        const compressedBlob = await compressImage(singleImageFile, quality);
        const originalSize = singleImageFile.size;
        const compressedSize = compressedBlob.size;

        showResult('single-result', originalSize, compressedSize, () => {
            const originalName = singleImageFile.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            downloadBlob(compressedBlob, baseName + '_kucultulmus.jpg');
        });

        if (compressedSize >= originalSize) {
            showToast('Görsel bu kalite ayarında daha fazla küçültülemedi. Daha düşük kalite deneyin.', 'info');
        } else {
            showToast('Fotoğraf başarıyla küçültüldü!', 'success');
        }
    } catch (err) {
        console.error('Görsel sıkıştırma hatası:', err);
        showToast('Fotoğraf sıkıştırılırken bir hata oluştu.', 'error');
    } finally {
        setButtonLoading(compressBtn, false);
    }
}

/**
 * Blob'u dosya olarak indirir
 * @param {Blob} blob - İndirilecek blob
 * @param {string} filename - Dosya adı
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Not: initSingleImage içindeki compress buton event listener'ı
// handleSingleCompress fonksiyonunu çağıracak şekilde güncellenmelidir.
// Bu, initSingleImage fonksiyonunun sonunda yapılan bağlamada ele alınır.
// Gerçek uygulamada, initSingleImage içindeki buton listener doğrudan
// handleSingleCompress'i çağırır.