// pdf-compress.js
/**
 * FK Küçült - PDF Sıkıştırma Modülü
 * PDF compression using PDF-lib library
 */

let pdfFile = null;

/**
 * PDF sıkıştırma görünümünü başlatır
 */
function initPdfCompress() {
    if (initializedViews.has('pdf')) return;
    initializedViews.add('pdf');

    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-file-input');
    const compressBtn = document.getElementById('pdf-compress-btn');
    const resultBox = document.getElementById('pdf-result');

    if (!dropzone || !fileInput || !compressBtn) return;

    // Dropzone tıklama
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Dosya input değişikliği
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handlePdfFile(files[0]);
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
            handlePdfFile(files[0]);
        }
    });

    // Sıkıştırma butonu
    compressBtn.addEventListener('click', () => {
        if (pdfFile) {
            compressPdf();
        } else {
            showToast('Lütfen önce bir PDF dosyası yükleyin.', 'error');
        }
    });

    /**
     * PDF dosyasını işler
     * @param {File} file - PDF dosyası
     */
    function handlePdfFile(file) {
        const ext = getFileExtension(file.name);
        if (ext !== 'pdf') {
            showToast('Lütfen geçerli bir PDF dosyası seçin.', 'error');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            showToast('Dosya boyutu 100 MB\'ı aşmamalıdır.', 'error');
            return;
        }

        pdfFile = file;
        showFileInfo('pdf-file-info', file.name, file.size);
        hideResult('pdf-result');
        compressBtn.disabled = false;
        showToast('PDF dosyası yüklendi. Küçült butonuna tıklayın.', 'success');
    }

    /**
     * PDF dosyasını sıkıştırır
     */
    async function compressPdf() {
        if (!pdfFile) return;

        setButtonLoading(compressBtn, true);
        hideResult('pdf-result');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true
            });

            // Nesne akışı sıkıştırması ile kaydet
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true
            });

            const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
            const originalSize = pdfFile.size;
            const compressedSize = compressedBlob.size;

            if (compressedSize >= originalSize) {
                showToast('Bu PDF zaten optimize edilmiş durumda. Daha fazla küçültülemedi.', 'info');
            }

            showResult('pdf-result', originalSize, compressedSize, () => {
                downloadBlob(compressedBlob, pdfFile.name.replace(/\.pdf$/i, '') + '_kucultulmus.pdf');
            });

            showToast('PDF başarıyla küçültüldü!', 'success');
        } catch (err) {
            console.error('PDF sıkıştırma hatası:', err);
            showToast('PDF sıkıştırılırken bir hata oluştu. Dosya bozuk veya şifreli olabilir.', 'error');
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
}