// --- ELEMENTI ---
const fileInput = document.getElementById("fileInput");
const captureButton = document.getElementById("captureButton");
const previewImg = document.getElementById("previewImg");
const imagePreview = document.getElementById("imagePreview");
const statusBox = document.getElementById("status");
const ocrText = document.getElementById("ocrText");
const mergeLinesBtn = document.getElementById("mergeLinesBtn");
const formatObsidianBtn = document.getElementById("formatObsidianBtn");
const addDetailsBtn = document.getElementById("addDetailsBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toast = document.getElementById("toast");

// --- CARICA / SCATTA IMMAGINE CON RIDIMENSIONAMENTO AUTOMATICO ---
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Ridimensionamento per evitare saturazione RAM su mobile
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Otteniamo l'immagine alleggerita
      const resizedImageData = canvas.toDataURL("image/jpeg", 0.85);

      previewImg.src = resizedImageData;
      imagePreview.style.display = "block";
      
      // Passiamo l'immagine alleggerita all'OCR
      runOCR(resizedImageData);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// --- OCR ---
function runOCR(imageData) {
  statusBox.innerText = "⏳ Analisi immagine in corso...";

  Tesseract.recognize(imageData, "ita", {
    logger: (m) => (statusBox.innerText = m.status)
  }).then(({ data: { text } }) => {
    ocrText.value = text;
    statusBox.innerText = "✔️ Testo estratto!";
  }).catch(err => {
    statusBox.innerText = "❌ Errore durante l'analisi";
    console.error(err);
  });
}

// --- UNISCI RIGHE ---
mergeLinesBtn.addEventListener("click", () => {
  const merged = ocrText.value.replace(/\n+/g, " ").trim();
  ocrText.value = merged;
});

// --- FORMATTA PER OBSIDIAN ---
formatObsidianBtn.addEventListener("click", () => {
  const formatted = `> ${ocrText.value.replace(/\n+/g, "\n> ")}`;
  ocrText.value = formatted;
});

// --- AGGIUNGI DETTAGLI ---
addDetailsBtn.addEventListener("click", () => {
  const title = document.getElementById("bookTitle").value || "Titolo sconosciuto";
  const page = document.getElementById("pageNumber").value || "Pagina?";
  ocrText.value = `**${title} — pag. ${page}**\n\n${ocrText.value}`;
});

// --- COPIA ---
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(ocrText.value).then(() => {
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 2000);
  });
});

// --- DOWNLOAD .MD ---
downloadBtn.addEventListener("click", () => {
  const blob = new Blob([ocrText.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "citazione.md";
  a.click();

  URL.revokeObjectURL(url);
});
