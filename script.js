function adjustIframeSize() {
    const fileContainer = document.getElementById("file-container");
    const iframe = fileContainer.querySelector("iframe");

    if (iframe) {
        // Rasio aspek layar (16:9)
        const aspectRatio = 16 / 9;

        // Lebar dan tinggi layar
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Hitung dimensi iframe berdasarkan rasio aspek
        let iframeWidth = containerWidth;
        let iframeHeight = containerWidth / aspectRatio;

        // Jika tinggi lebih besar dari layar, sesuaikan dengan tinggi layar
        if (iframeHeight > containerHeight) {
            iframeHeight = containerHeight;
            iframeWidth = containerHeight * aspectRatio;
        }

        // Terapkan dimensi ke iframe
        iframe.style.width = `${iframeWidth}px`;
        iframe.style.height = `${iframeHeight}px`;
    }
}

// Panggil fungsi saat halaman dimuat dan saat ukuran layar berubah
window.onload = function () {
    fetchAndDisplayFile(); // Tampilkan file
    adjustIframeSize(); // Sesuaikan ukuran iframe
};
window.onresize = adjustIframeSize; // Sesuaikan ukuran saat layar diubah
