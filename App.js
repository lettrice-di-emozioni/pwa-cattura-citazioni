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

// --- CARICA / SCATTA IMMAGINE ---
captureButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    imagePreview.style.display = "block";
    runOCR(reader.result);
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
