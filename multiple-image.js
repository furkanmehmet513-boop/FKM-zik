// multiple-images.js
/**
 * FK Küçült - Çoklu Fotoğraf Sıkıştırma Modülü
 * Multiple image compression with ZIP packaging using JSZip
 */

let multipleFiles = [];

/**
 * Çoklu fotoğraf sıkıştırma görünümünü başlatır
 */
function initMultipleImages() {
    if (initializedViews.has('multiple-images')) return;
    initializedViews.add('multiple-images');

    const dropzone = document.getElementById('multi-dropzone');
    const fileInput = document.getElementById('multi-file-input');
    const compressBtn = document.getElementById('multi-compress-btn');
    const qualitySlider = document.getElementById('multi-quality');
    const qualityValue = document.getElementById('multi-quality-value');
    const qualityControl = document.getElementById('multi-quality-control');
    const fileListContainer = document.getElementById('multi-file-list');
    const resultBox = document.getElementById('multi-result');

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
            addMultipleFiles(Array.from(files));
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
            addMultipleFiles(Array.from(files));
        }
    });

    // Sıkıştırma butonu
    compressBtn.addEventListener('click', () => {
        if (multipleFiles.length > 0) {
            compressAllImages();
        } else {
            showToast('Lütfen en az bir fotoğraf yükleyin.', 'error');
        }
    });

    // İlk render
    renderMultipleFileList();
}

/**
 * Dosya dizisine yeni dosyalar ekler
 * @param {File[]} files - Eklenecek dosyalar
 */
function addMultipleFiles(files) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
    let addedCount = 0;

    files.forEach(file => {
        if (validTypes.includes(file.type) || file.type.startsWith('image/')) {
            if (file.size <= 50 * 1024 * 1024) {
                // Aynı isimde dosya varsa kontrol et (basitçe ekle, üzerine yazma)
                multipleFiles.push(file);
                addedCount++;
            } else {
                showToast(`"${file.name}" 50 MB sınırını aşıyor, atlandı.`, 'error');
            }
        } else {
            showToast(`"${file.name}" geçerli bir görsel değil, atlandı.`, 'error');
        }
    });

    if (addedCount > 0) {
        renderMultipleFileList();
        updateMultiUIState();
        showToast(`${addedCount} fotoğraf eklendi. (Toplam: ${multipleFiles.length})`, 'success');
    }
}

/**
 * Belirtilen indeksteki dosyayı listeden kaldırır
 * @param {number} index - Kaldırılacak dosyanın indeksi
 */
function removeMultipleFile(index) {
    if (index >= 0 && index < multipleFiles.length) {
        const removedName = multipleFiles[index].name;
        multipleFiles.splice(index, 1);
        renderMultipleFileList();
        updateMultiUIState();
        hideResult('multi-result');
        showToast(`"${removedName}" listeden kaldırıldı.`, 'info');
    }
}

/**
 * Dosya listesini yeniden render eder
 */
function renderMultipleFileList() {
    const container = document.getElementById('multi-file-list');
    const qualityControl = document.getElementById('multi-quality-control');
    if (!container) return;

    if (multipleFiles.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        if (qualityControl) qualityControl.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    if (qualityControl) qualityControl.style.display = 'block';

    container.innerHTML = '';

    multipleFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'multi-file-item';

        // Küçük resim oluştur
        const thumb = document.createElement('img');
        thumb.className = 'multi-file-thumb';
        thumb.alt = 'Önizleme';
        const reader = new FileReader();
        reader.onload = (e) => {
            thumb.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'multi-file-info';
        infoDiv.innerHTML = `
            <div class="multi-file-name" title="${file.name}">${file.name}</div>
            <div class="multi-file-size">${formatBytes(file.size)}</div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'multi-file-delete';
        deleteBtn.title = 'Kaldır';
        deleteBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeMultipleFile(index);
        });

        item.appendChild(thumb);
        item.appendChild(infoDiv);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}

/**
 * Çoklu görsel UI durumunu günceller
 */
function updateMultiUIState() {
    const compressBtn = document.getElementById('multi-compress-btn');
    if (compressBtn) {
        compressBtn.disabled = multipleFiles.length === 0;
    }
}

/**
 * Tüm görselleri sıkıştırır ve ZIP olarak indirir
 */
async function compressAllImages() {
    const compressBtn = document.getElementById('multi-compress-btn');
    const qualitySlider = document.getElementById('multi-quality');
    const resultBox = document.getElementById('multi-result');

    if (multipleFiles.length === 0) return;

    setButtonLoading(compressBtn, true);
    hideResult('multi-result');

    try {
        const quality = qualitySlider ? parseInt(qualitySlider.value) : 70;
        const zip = new JSZip();
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;

        for (let i = 0; i < multipleFiles.length; i++) {
            const file = multipleFiles[i];
            totalOriginalSize += file.size;

            try {
                const compressedBlob = await compressImage(file, quality);
                totalCompressedSize += compressedBlob.size;

                // Orijinal adın uzantısını .jpg ile değiştir
                const originalName = file.name;
                const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                let zipFileName = baseName + '.jpg';

                // Aynı isimde dosya varsa numaralandır
                let counter = 1;
                while (zip.file(zipFileName)) {
                    zipFileName = baseName + '_' + counter + '.jpg';
                    counter++;
                }

                zip.file(zipFileName, compressedBlob);
            } catch (err) {
                console.error(`"${file.name}" sıkıştırılamadı:`, err);
                showToast(`"${file.name}" sıkıştırılamadı, atlanıyor.`, 'error');
            }
        }

        if (Object.keys(zip.files).length === 0) {
            throw new Error('Hiçbir görsel sıkıştırılamadı.');
        }

        // ZIP oluştur
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        showResult('multi-result', totalOriginalSize, zipBlob.size, () => {
            downloadBlob(zipBlob, 'kucultulmus_fotograflar.zip');
        });

        showToast(`${Object.keys(zip.files).length} fotoğraf ZIP olarak paketlendi!`, 'success');
    } catch (err) {
        console.error('Çoklu sıkıştırma hatası:', err);
        showToast('Fotoğraflar sıkıştırılırken bir hata oluştu.', 'error');
    } finally {
        setButtonLoading(compressBtn, false);
    }
}