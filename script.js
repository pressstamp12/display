const SPREADSHEET_ID = '1atuDQUwMD7lud9omrIBCUjPx6fb0TEj0XfwBKqaRllM'; // Ganti dengan ID spreadsheet Anda
const API_KEY = 'AIzaSyBuqQ8CXTAcEvMvZpoqzz8f62zUWPCOb4M'; // Ganti dengan API Key Anda
const RANGE = 'Sheet1!A:C'; // Ambil kolom A sampai C

// Ambil data dari Google Sheets
async function fetchData() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`);
    const data = await response.json();
    
    // Isi dropdown dengan data dari spreadsheet
    const dropdown = document.getElementById("part-number");
    data.values.forEach(row => {
        const option = document.createElement("option");
        option.value = row[0]; // Kode Part Number
        option.dataset.fileId = row[1]; // ID Google Drive
        option.dataset.instruction = row[2] || ""; // Instruksi dari kolom C
        option.textContent = row[0]; // Tampilkan hanya kode part
        dropdown.appendChild(option);
    });
}

// Tampilkan file dan instruksi
function showFile() {
    const partNumber = document.getElementById("part-number");
    const fileContainer = document.getElementById("file-container"); // Kontainer untuk fullscreen
    const fileDisplay = document.getElementById("file-display");
    const loading = document.getElementById("loading");
    const instructionDisplay = document.getElementById("instruction"); // Elemen instruksi

    fileDisplay.innerHTML = ""; // Bersihkan konten sebelumnya
    loading.style.display = "none"; // Sembunyikan loading sebelumnya
    instructionDisplay.textContent = ""; // Bersihkan instruksi sebelumnya

    if (partNumber.value !== "") {
        const fileID = partNumber.options[partNumber.selectedIndex].dataset.fileId; // Ambil ID dari atribut data
        const instruction = partNumber.options[partNumber.selectedIndex].dataset.instruction; // Ambil instruksi

        // Tampilkan instruksi
        instructionDisplay.textContent = `Instruksi: ${instruction}`; // Tampilkan instruksi

        if (fileID) {
            // Tampilkan loading
            loading.style.display = "block";

            const filePath = `https://drive.google.com/file/d/${fileID}/preview`;
            const iframe = document.createElement('iframe');
            iframe.src = filePath;
            iframe.width = "100%";
            iframe.height = "500px";

            fileDisplay.appendChild(iframe);

            // Sembunyikan loading setelah iframe ditambahkan
            loading.style.display = "none";

            // Minta fileContainer masuk ke mode fullscreen bersama instruksi dan iframe
            if (fileContainer.requestFullscreen) {
                fileContainer.requestFullscreen();
            } else if (fileContainer.mozRequestFullScreen) { // Firefox
                fileContainer.mozRequestFullScreen();
            } else if (fileContainer.webkitRequestFullscreen) { // Chrome, Safari, Opera
                fileContainer.webkitRequestFullscreen();
            } else if (fileContainer.msRequestFullscreen) { // IE/Edge
                fileContainer.msRequestFullscreen();
            }
        }
    }
}


// Panggil fetchData saat halaman dimuat
window.onload = fetchData;
