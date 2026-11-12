const SPREADSHEET_ID = '1atuDQUwMD7lud9omrIBCUjPx6fb0TEj0XfwBKqaRllM';
const API_KEY = 'AIzaSyBuqQ8CXTAcEvMvZpoqzz8f62zUWPCOb4M';
const RANGE_PART_NUMBER = 'TR 800t!A:C'; // Kolom A (Part Number), B (ID File), C (Instruksi)
const RANGE_E1 = 'TR 800t!E1'; // Sel Part Number / Aktivitas aktif

// Daftar aktivitas yang TIDAK menampilkan tulisan "SEDANG PRODUKSI"
const NON_PRODUCTION_ACTIVITIES = ['WATARI', 'DANDORI', 'TRIAL', 'TPM', 'KS1', 'KS2'];

let previousPartNumber = null;

// Fungsi untuk memaksa tampilan Full Screen
function forceFullScreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) { // Safari / Android WebView lama
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
}

// Jalankan fullscreen saat halaman dimuat dan saat layar disentuh/diklik pertama kali
window.addEventListener('load', forceFullScreen);
document.addEventListener('click', forceFullScreen);
document.addEventListener('touchstart', forceFullScreen);

async function fetchPartNumber() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE_E1)}?key=${API_KEY}`);
    if (!response.ok) throw new Error('Gagal mengambil data E1 dari Google Sheets');
    const data = await response.json();
    return data.values && data.values[0] ? data.values[0][0].trim() : null;
}

async function fetchDatabase() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE_PART_NUMBER)}?key=${API_KEY}`);
    if (!response.ok) throw new Error('Gagal mengambil database dari Google Sheets');
    const data = await response.json();
    return data.values || [];
}

function showError(message) {
    const errorToast = document.getElementById("error-toast");
    if (message) {
        errorToast.textContent = message;
        errorToast.classList.remove("hidden");
    } else {
        errorToast.classList.add("hidden");
    }
}

async function updateDisplay() {
    try {
        const currentPartNumber = await fetchPartNumber();

        if (!currentPartNumber) {
            showError("Menunggu input Part Number di E1...");
            return;
        }

        // Jika tidak ada perubahan, lewati pembaruan iframe
        if (currentPartNumber === previousPartNumber) {
            showError(null); // Bersihkan pesan error jika jaringan sudah normal kembali
            return;
        }

        // Ambil database dan cari kecocokan
        const database = await fetchDatabase();
        const match = database.find(row => row[0] && row[0].trim().toUpperCase() === currentPartNumber.toUpperCase());

        if (!match) {
            showError(`Data "${currentPartNumber}" tidak ditemukan di database.`);
            return;
        }

        const fileID = match[1] ? match[1].trim() : "";
        const instruction = match[2] ? match[2].trim() : "";

        // 1. Tampilkan file Google Drive di iframe
        const fileDisplay = document.getElementById("file-display");
        fileDisplay.innerHTML = "";
        if (fileID) {
            const iframe = document.createElement("iframe");
            iframe.src = `https://drive.google.com/file/d/${fileID}/preview`;
            iframe.allow = "autoplay; fullscreen";
            fileDisplay.appendChild(iframe);
        }

        // 2. Atur kemunculan tulisan "SEDANG PRODUKSI"
        const productionBanner = document.getElementById("production-banner");
        const productionText = document.getElementById("production-text");
        const isNonProduction = NON_PRODUCTION_ACTIVITIES.includes(currentPartNumber.toUpperCase());

        if (isNonProduction) {
            // Sembunyikan jika aktivitas adalah WATARI, DANDORI, TRIAL, TPM, KS1, atau KS2
            productionBanner.classList.add("hidden");
        } else {
            // Tampilkan jika merupakan Part Number
            productionText.textContent = `SEDANG PRODUKSI : ${currentPartNumber}`;
            productionBanner.classList.remove("hidden");
        }

        // 3. Tampilkan instruksi tambahan jika ada di Kolom C
        const instructionDisplay = document.getElementById("instruction");
        if (instruction) {
            instructionDisplay.textContent = instruction;
            instructionDisplay.classList.remove("hidden");
        } else {
            instructionDisplay.classList.add("hidden");
        }

        // Simpan status terbaru hanya setelah semua proses berhasil
        previousPartNumber = currentPartNumber;
        showError(null);

    } catch (error) {
        console.error(error.message);
        showError(`Koneksi / Sistem: ${error.message}`);
    }
}

// Periksa perubahan setiap 5 detik
setInterval(updateDisplay, 5000);

// Panggil fungsi sekali saat halaman pertama kali dibuka
window.onload = () => {
    forceFullScreen();
    updateDisplay();
};
