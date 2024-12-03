const SPREADSHEET_ID = '1atuDQUwMD7lud9omrIBCUjPx6fb0TEj0XfwBKqaRllM'; // ID spreadsheet Anda
const API_KEY = 'AIzaSyBuqQ8CXTAcEvMvZpoqzz8f62zUWPCOb4M'; // API Key Anda
const RANGE_PART_NUMBER = 'Sheet1!A:C'; // Ambil kolom A (Part Number), B (ID File), dan C (Instruksi)
const RANGE_E1 = 'Sheet1!E1'; // Ambil Part Number di E1

let previousPartNumber = null; // Menyimpan nilai E1 sebelumnya untuk mendeteksi perubahan

async function fetchPartNumber() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_E1}?key=${API_KEY}`);
    const data = await response.json();
    return data.values ? data.values[0][0] : null; // Mengembalikan part number dari E1
}

async function fetchDatabase() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE_PART_NUMBER}?key=${API_KEY}`);
    const data = await response.json();
    return data.values || []; // Mengembalikan seluruh database
}

async function updateDisplay() {
    try {
        // Ambil part number terbaru dari E1
        const currentPartNumber = await fetchPartNumber();

        // Jika part number tidak berubah, tidak perlu memperbarui
        if (currentPartNumber === previousPartNumber) {
            return;
        }

        previousPartNumber = currentPartNumber; // Perbarui part number sebelumnya

        // Ambil database untuk mencocokkan part number
        const database = await fetchDatabase();
        const match = database.find(row => row[0] === currentPartNumber);

        if (!match) {
            throw new Error(`Part Number ${currentPartNumber} tidak ditemukan di database.`);
        }

        const fileID = match[1]; // ID Google Drive
        const instruction = match[2] || ""; // Instruksi (opsional)

        // Tampilkan file
        const fileDisplay = document.getElementById("file-display");
        fileDisplay.innerHTML = ""; // Bersihkan tampilan sebelumnya
        const iframe = document.createElement("iframe");
        iframe.src = `https://drive.google.com/file/d/${fileID}/preview`;
        fileDisplay.appendChild(iframe);

        // Tampilkan instruksi
        const instructionDisplay = document.getElementById("instruction");
        instructionDisplay.textContent = instruction;

        // Sesuaikan ukuran iframe
        adjustIframeSize();
    } catch (error) {
        console.error(error.message);
        alert(`Terjadi kesalahan: ${error.message}`);
    }
}

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

// Periksa perubahan setiap 5 detik
setInterval(updateDisplay, 5000);

// Panggil fungsi sekali saat halaman dimuat
window.onload = updateDisplay;
window.onresize = adjustIframeSize; // Sesuaikan ukuran saat layar diubah
