const captureButton = document.getElementById("captureButton");
const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const imagePreview = document.getElementById("imagePreview");
const statusBox = document.getElementById("status") || document.getElementById("statusBox");
const ocrText = document.getElementById("ocrText");
const mergeLinesBtn = document.getElementById("mergeLinesBtn");
const formatObsidianBtn = document.getElementById("formatObsidianBtn");
const addDetailsBtn = document.getElementById("addDetailsBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toast = document.getElementById("toast");

// --- CARICA / SCATTA IMMAGINE CON RIDIMENSIONAMENTO AUTOMATICO ---
if (captureButton && fileInput) {
  captureButton.addEventListener("click", () => fileInput.click());
}

if (fileInput) {
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

        if (previewImg) previewImg.src = resizedImageData;
        if (imagePreview) imagePreview.style.display = "block";
        
        // Passiamo l'immagine alleggerita all'OCR
        runOCR(resizedImageData);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- OCR ---
function runOCR(imageData) {
  if (statusBox) statusBox.innerText = "⏳ Analisi immagine in corso...";

  Tesseract.recognize(imageData, "ita", {
    logger: (m) => {
      if (statusBox) statusBox.innerText = m.status;
    }
  }).then(({ data: { text } }) => {
    if (ocrText) ocrText.value = text;
    if (statusBox) statusBox.innerText = "✔️ Testo estratto!";
  }).catch(err => {
    if (statusBox) statusBox.innerText = "❌ Errore durante l'analisi";
    console.error(err);
  });
}

// --- UNISCI RIGHE ---
if (mergeLinesBtn) {
  mergeLinesBtn.addEventListener("click", () => {
    if (ocrText) {
      const merged = ocrText.value.replace(/\n+/g, " ").trim();
      ocrText.value = merged;
    }
  });
}

// --- FORMATTA PER OBSIDIAN ---
if (formatObsidianBtn) {
  formatObsidianBtn.addEventListener("click", () => {
    if (ocrText) {
      const formatted = `> ${ocrText.value.replace(/\n+/g, "\n> ")}`;
      ocrText.value = formatted;
    }
  });
}

// --- AGGIUNGI DETTAGLI ---
if (addDetailsBtn) {
  addDetailsBtn.addEventListener("click", () => {
    const bookTitleEl = document.getElementById("bookTitle") || document.getElementById("pageTitle");
    const pageNumEl = document.getElementById("pageNum") || document.getElementById("pageNumber");
    
    const bookTitle = bookTitleEl ? bookTitleEl.value : "";
    const pageNum = pageNumEl ? pageNumEl.value : "";
    let details = "";

    if (bookTitle || pageNum) {
      details = `\n\n— *${bookTitle || "Titolo sconosciuto"}*${pageNum ? `, pag. ${pageNum}` : ""}`;
    }

    if (ocrText) ocrText.value += details;
  });
}

// --- COPIA NEGLI APPUNTI ---
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText.value).then(() => {
        showToast("Copiato negli appunti!");
      });
    }
  });
}

// --- SCARICA NOTA (.MD) ---
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const bookTitleEl = document.getElementById("bookTitle") || document.getElementById("pageTitle");
    const bookTitle = (bookTitleEl && bookTitleEl.value) ? bookTitleEl.value : "Citazione";
    if (ocrText) {
      const blob = new Blob([ocrText.value], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${bookTitle}.md`;
      a.click();
    }
  });
}

function showToast(msg) {
  if (toast) {
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}
