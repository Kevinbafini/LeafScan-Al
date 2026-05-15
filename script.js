const MODEL_URL = "https://teachablemachine.withgoogle.com/models/4E_rRHs43/";

const DISEASE_INFO = {
  "Healthy Leaf": {
    displayName: "Folha Saudável",
    description: "A folha apresenta aparência saudável, com coloração uniforme e sem sinais visíveis de lesões.",
    severity: "Baixa",
    recommendation: "Mantenha o monitoramento regular, irrigação equilibrada e boas práticas de manejo.",
    icon: "fa-solid fa-leaf",
    causes: [
      "Não foram identificados sinais visíveis de doença.",
      "A folha apresenta coloração e textura dentro do esperado."
    ],
    treatment: [
      "Nenhum tratamento específico é necessário.",
      "Mantenha irrigação e adubação equilibradas."
    ],
    prevention: [
      "Realize monitoramento periódico.",
      "Evite excesso de umidade nas folhas.",
      "Mantenha boas práticas de manejo."
    ]
  },
  "Citrus Canker": {
    displayName: "Cancro Cítrico",
    description: "Doença bacteriana que pode causar lesões elevadas, manchas amareladas e danos em folhas, ramos e frutos.",
    severity: "Alta",
    recommendation: "Evite o contato com outras plantas, remova materiais muito afetados e procure orientação técnica especializada.",
    icon: "fa-solid fa-bacteria",
    causes: [
      "Disseminação por chuva, vento e respingos de água.",
      "Ferramentas de poda contaminadas.",
      "Contato com material vegetal infectado."
    ],
    treatment: [
      "Remova folhas e ramos muito afetados.",
      "Desinfete ferramentas após o manejo.",
      "Procure orientação técnica para controle adequado."
    ],
    prevention: [
      "Evite molhar excessivamente as folhas.",
      "Use mudas sadias e material certificado.",
      "Mantenha inspeções frequentes no pomar."
    ]
  },
  "Black Spot": {
    displayName: "Mancha Preta",
    description: "Doença fúngica que pode formar manchas escuras, lesões circulares e áreas necrosadas nas folhas.",
    severity: "Média",
    recommendation: "Remova folhas e resíduos contaminados, melhore a circulação de ar e busque orientação sobre manejo preventivo.",
    icon: "fa-solid fa-circle-exclamation",
    causes: [
      "Presença de fungos associados a restos vegetais infectados.",
      "Alta umidade e baixa circulação de ar.",
      "Acúmulo de folhas e frutos contaminados no solo."
    ],
    treatment: [
      "Remova resíduos vegetais infectados.",
      "Melhore a ventilação da planta.",
      "Consulte orientação técnica sobre manejo fúngico."
    ],
    prevention: [
      "Mantenha limpeza ao redor da planta.",
      "Evite excesso de umidade.",
      "Realize podas para melhorar a circulação de ar."
    ]
  },
  "Greening": {
    displayName: "Greening dos Citros",
    description: "Doença severa associada a mosqueamento irregular, amarelecimento, queda de vigor e redução da produtividade.",
    severity: "Alta",
    recommendation: "Inspecione plantas próximas, monitore insetos vetores e procure suporte técnico para confirmação e manejo.",
    icon: "fa-solid fa-seedling",
    causes: [
      "Doença associada à bactéria transmitida pelo psilídeo dos citros.",
      "Presença de plantas infectadas próximas.",
      "Disseminação por insetos vetores."
    ],
    treatment: [
      "Procure orientação técnica imediatamente.",
      "Monitore a presença de psilídeos.",
      "Remova plantas severamente comprometidas quando recomendado."
    ],
    prevention: [
      "Controle o inseto vetor.",
      "Use mudas certificadas.",
      "Realize inspeções frequentes em folhas e brotações."
    ]
  },
  "Melanose": {
    displayName: "Melanose",
    description: "Doença fúngica que pode causar pequenas manchas escuras e ásperas em folhas, ramos e frutos.",
    severity: "Média",
    recommendation: "Faça podas sanitárias, reduza a umidade excessiva na copa e acompanhe a evolução dos sintomas.",
    icon: "fa-solid fa-virus",
    causes: [
      "Fungo favorecido por umidade elevada.",
      "Presença de galhos secos ou material infectado.",
      "Baixa renovação de ar na copa."
    ],
    treatment: [
      "Remova galhos secos e partes infectadas.",
      "Melhore a aeração da planta.",
      "Consulte manejo recomendado para doenças fúngicas."
    ],
    prevention: [
      "Realize podas sanitárias.",
      "Evite acúmulo de material vegetal morto.",
      "Mantenha monitoramento em períodos úmidos."
    ]
  },
  "Anthracnose": {
    displayName: "Antracnose",
    description: "Doença fúngica associada a manchas marrons, áreas necrosadas e danos em folhas e ramos jovens.",
    severity: "Média",
    recommendation: "Remova tecidos afetados, reduza períodos prolongados de umidade e mantenha boa ventilação da planta.",
    icon: "fa-solid fa-bug",
    causes: [
      "Alta umidade e molhamento prolongado das folhas.",
      "Fungos presentes em tecidos infectados.",
      "Ferimentos em folhas e ramos."
    ],
    treatment: [
      "Remova tecidos infectados.",
      "Reduza o molhamento prolongado das folhas.",
      "Procure orientação técnica para controle adequado."
    ],
    prevention: [
      "Evite irrigação sobre as folhas.",
      "Faça podas para melhorar ventilação.",
      "Mantenha ferramentas limpas."
    ]
  },
  "Dry Leaf": {
    displayName: "Folha Seca",
    description: "O ressecamento pode estar relacionado a estresse hídrico, calor excessivo, problemas de raiz ou danos avançados no tecido.",
    severity: "Média",
    recommendation: "Verifique a umidade do solo, drenagem, frequência de irrigação e condições gerais da planta.",
    icon: "fa-solid fa-sun",
    causes: [
      "Estresse hídrico ou irrigação insuficiente.",
      "Calor excessivo ou exposição intensa ao sol.",
      "Problemas de drenagem ou raiz."
    ],
    treatment: [
      "Verifique a umidade do solo.",
      "Ajuste a frequência de irrigação.",
      "Avalie as condições das raízes e drenagem."
    ],
    prevention: [
      "Mantenha irrigação regular.",
      "Evite encharcamento do solo.",
      "Proteja plantas jovens de calor extremo."
    ]
  },
  "Nutrient Deficiency": {
    displayName: "Deficiência Nutricional",
    description: "Desequilíbrios nutricionais podem causar clorose, manchas, crescimento fraco e alteração na coloração das folhas.",
    severity: "Média",
    recommendation: "Realize avaliação do solo ou da folha e ajuste a adubação com base em orientação agronômica.",
    icon: "fa-solid fa-flask",
    causes: [
      "Falta ou desequilíbrio de nutrientes no solo.",
      "pH inadequado dificultando absorção.",
      "Problemas nas raízes."
    ],
    treatment: [
      "Realize análise do solo ou da folha.",
      "Corrija a adubação conforme orientação técnica.",
      "Verifique drenagem e saúde das raízes."
    ],
    prevention: [
      "Mantenha plano de adubação equilibrado.",
      "Monitore a coloração das folhas.",
      "Faça análises periódicas do solo."
    ]
  },
  "Sooty Mold": {
    displayName: "Fumagina",
    description: "Camada escura superficial que costuma se desenvolver sobre secreções açucaradas deixadas por insetos sugadores.",
    severity: "Média",
    recommendation: "Controle a presença de insetos, remova depósitos intensos quando possível e favoreça a ventilação da planta.",
    icon: "fa-solid fa-smog",
    causes: [
      "Presença de insetos sugadores que liberam substância açucarada.",
      "Acúmulo de fungo escuro na superfície da folha.",
      "Ambiente com baixa ventilação."
    ],
    treatment: [
      "Controle os insetos causadores.",
      "Limpe folhas muito afetadas quando possível.",
      "Melhore a ventilação da planta."
    ],
    prevention: [
      "Monitore pragas como pulgões e cochonilhas.",
      "Evite alta infestação de insetos sugadores.",
      "Mantenha inspeções frequentes."
    ]
  }
};

const HISTORY_KEY = "leafscan-ai-history";
const PLACEHOLDER_URL = "PASTE_YOUR_TEACHABLE_MACHINE_MODEL_URL_HERE";
const HISTORY_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'%3E%3Crect width='480' height='360' fill='%23edf6e9'/%3E%3Cpath d='M240 95c58 48 87 96 87 145 0 47-35 79-87 79s-87-32-87-79c0-49 29-97 87-145z' fill='%23287a45' opacity='.18'/%3E%3Cpath d='M240 132v150' stroke='%23287a45' stroke-width='12' stroke-linecap='round' opacity='.45'/%3E%3C/svg%3E";

let model = null;
let maxPredictions = 0;
let selectedImageData = "";
let selectedImageFileName = "";
let cameraStream = null;
let activeHistoryFilter = "all";
let renderedHistory = [];
let currentAnalysisDateTime = "";

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  renderDiseaseCards();
  renderHistory();
  bindEvents();
  updateModelStatus();
  loadModel();
});

function cacheElements() {
  elements.modelStatusText = document.getElementById("modelStatusText");
  elements.configurationWarning = document.getElementById("configurationWarning");
  elements.diseaseGrid = document.getElementById("diseaseGrid");
  elements.imageInput = document.getElementById("imageInput");
  elements.imagePreview = document.getElementById("imagePreview");
  elements.emptyPreview = document.getElementById("emptyPreview");
  elements.dropZone = document.getElementById("dropZone");
  elements.startCameraBtn = document.getElementById("startCameraBtn");
  elements.captureBtn = document.getElementById("captureBtn");
  elements.stopCameraBtn = document.getElementById("stopCameraBtn");
  elements.cameraVideo = document.getElementById("cameraVideo");
  elements.captureCanvas = document.getElementById("captureCanvas");
  elements.analyzeBtn = document.getElementById("analyzeBtn");
  elements.errorMessage = document.getElementById("errorMessage");
  elements.resultDashboard = document.getElementById("resultDashboard");
  elements.downloadReportBtn = document.getElementById("downloadReportBtn");
  elements.newAnalysisBtn = document.getElementById("newAnalysisBtn");
  elements.loadingState = document.getElementById("loadingState");
  elements.emptyResult = document.getElementById("emptyResult");
  elements.resultContent = document.getElementById("resultContent");
  elements.resultTitle = document.getElementById("result-title");
  elements.dashboardImagePreview = document.getElementById("dashboardImagePreview");
  elements.analyzedImageTitle = document.getElementById("analyzedImageTitle");
  elements.analysisDateText = document.getElementById("analysisDateText");
  elements.diagnosisName = document.getElementById("diagnosisName");
  elements.confidenceValue = document.getElementById("confidenceValue");
  elements.confidenceBar = document.getElementById("confidenceBar");
  elements.confidenceLevelText = document.getElementById("confidenceLevelText");
  elements.severityBadge = document.getElementById("severityBadge");
  elements.resultDescription = document.getElementById("resultDescription");
  elements.causesList = document.getElementById("causesList");
  elements.treatmentList = document.getElementById("treatmentList");
  elements.preventionList = document.getElementById("preventionList");
  elements.lowConfidenceWarning = document.getElementById("lowConfidenceWarning");
  elements.probabilityList = document.getElementById("probabilityList");
  elements.historyList = document.getElementById("historyList");
  elements.clearHistoryBtn = document.getElementById("clearHistoryBtn");
  elements.historySearchInput = document.getElementById("historySearchInput");
  elements.historyFilterBtn = document.getElementById("historyFilterBtn");
  elements.historyFilterMenu = document.getElementById("historyFilterMenu");
  elements.reportModal = document.getElementById("reportModal");
  elements.reportModalContent = document.getElementById("reportModalContent");
  elements.reportCloseBtn = document.getElementById("reportCloseBtn");
  elements.reportModalBody = document.getElementById("reportModalBody");
  elements.appToast = document.getElementById("appToast");
  elements.navLinks = document.querySelectorAll(".nav-link");
}

function bindEvents() {
  elements.imageInput.addEventListener("change", handleFileSelection);
  elements.dropZone.addEventListener("click", () => elements.imageInput.click());
  elements.dropZone.addEventListener("keydown", handleDropZoneKeydown);
  elements.dropZone.addEventListener("dragover", handleDragOver);
  elements.dropZone.addEventListener("dragleave", handleDragLeave);
  elements.dropZone.addEventListener("drop", handleDrop);
  elements.analyzeBtn.addEventListener("click", analyzeImage);
  elements.startCameraBtn.addEventListener("click", startCamera);
  elements.captureBtn.addEventListener("click", captureImage);
  elements.stopCameraBtn.addEventListener("click", stopCamera);
  elements.downloadReportBtn.addEventListener("click", downloadReport);
  elements.newAnalysisBtn.addEventListener("click", resetCurrentAnalysis);
  elements.clearHistoryBtn.addEventListener("click", clearHistory);
  elements.historySearchInput.addEventListener("input", renderHistory);
  elements.historyFilterBtn.addEventListener("click", toggleHistoryFilterMenu);
  elements.historyFilterMenu.addEventListener("click", handleHistoryFilterSelection);
  elements.historyList.addEventListener("click", handleHistoryCardClick);
  elements.reportCloseBtn.addEventListener("click", closeReportModal);
  elements.reportModal.addEventListener("click", handleReportModalClick);
  document.addEventListener("keydown", handleGlobalKeydown);
  document.addEventListener("click", handleDocumentClick);
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveNavLink(link));
  });
}

function isModelConfigured() {
  return MODEL_URL && MODEL_URL !== PLACEHOLDER_URL && MODEL_URL.startsWith("http");
}

function getModelBaseUrl() {
  return MODEL_URL.endsWith("/") ? MODEL_URL : `${MODEL_URL}/`;
}

function updateModelStatus(message, ready = false) {
  const configured = isModelConfigured();
  const status = message || (configured ? "Preparando análise" : "Análise indisponível");
  elements.modelStatusText.textContent = status;

  if (configured && ready) {
    elements.configurationWarning.classList.add("is-ready");
    elements.configurationWarning.innerHTML = "<strong>Sistema pronto:</strong> envie uma imagem da folha para iniciar a avaliação.";
  } else if (configured) {
    elements.configurationWarning.classList.remove("is-ready");
    elements.configurationWarning.innerHTML = "<strong>Preparando análise:</strong> aguarde alguns instantes antes de enviar a imagem.";
  } else {
    elements.configurationWarning.classList.remove("is-ready");
    elements.configurationWarning.innerHTML = "<strong>Análise temporariamente indisponível:</strong> tente novamente em instantes.";
  }
}

async function loadModel() {
  if (!isModelConfigured()) {
    updateModelStatus("Análise indisponível");
    return;
  }

  try {
    const modelURL = `${getModelBaseUrl()}model.json`;
    const metadataURL = `${getModelBaseUrl()}metadata.json`;
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    updateModelStatus("Sistema pronto para análise", true);
  } catch (error) {
    model = null;
    showError("O sistema de análise não pôde ser iniciado. Tente novamente em instantes.");
    updateModelStatus("Análise indisponível");
    console.error(error);
  }
}

function renderDiseaseCards() {
  elements.diseaseGrid.innerHTML = Object.values(DISEASE_INFO).map((disease) => `
    <article class="disease-card">
      <span class="card-icon" aria-hidden="true"><i class="${disease.icon}"></i></span>
      <h3>${disease.displayName}</h3>
      <p>${disease.description}</p>
    </article>
  `).join("");
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  readImageFile(file);
}

function handleDropZoneKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.imageInput.click();
  }
}

function handleDragOver(event) {
  event.preventDefault();
  elements.dropZone.classList.add("is-dragover");
}

function handleDragLeave() {
  elements.dropZone.classList.remove("is-dragover");
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove("is-dragover");
  const file = event.dataTransfer.files[0];
  readImageFile(file);
}

function readImageFile(file) {
  clearError();

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showError("Selecione um arquivo de imagem válido.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setSelectedImage(reader.result, file.name);
  reader.onerror = () => showError("Não foi possível carregar a imagem selecionada.");
  reader.readAsDataURL(file);
}

function setSelectedImage(dataUrl, fileName = "") {
  selectedImageData = dataUrl;
  selectedImageFileName = fileName;
  elements.imagePreview.src = dataUrl;
  elements.imagePreview.hidden = false;
  elements.emptyPreview.hidden = true;
  elements.emptyResult.textContent = "Imagem carregada. Clique em Analisar Folha para iniciar a avaliação.";
  elements.resultDashboard.hidden = true;
  elements.resultContent.hidden = true;
  elements.emptyResult.hidden = false;
  clearError();
}

async function startCamera() {
  clearError();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError("A captura pela câmera não está disponível neste dispositivo.");
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    elements.cameraVideo.srcObject = cameraStream;
    elements.cameraVideo.hidden = false;
    elements.captureBtn.disabled = false;
    elements.stopCameraBtn.disabled = false;
    elements.startCameraBtn.disabled = true;
  } catch (error) {
    showError("A câmera não pôde ser acessada. Verifique as permissões do navegador.");
    console.error(error);
  }
}

function captureImage() {
  if (!cameraStream) {
    showError("Abra a câmera antes de capturar a imagem.");
    return;
  }

  const video = elements.cameraVideo;
  const canvas = elements.captureCanvas;
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 960;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  setSelectedImage(canvas.toDataURL("image/jpeg", 0.92), "Imagem capturada pela câmera");
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }

  cameraStream = null;
  elements.cameraVideo.srcObject = null;
  elements.cameraVideo.hidden = true;
  elements.captureBtn.disabled = true;
  elements.stopCameraBtn.disabled = true;
  elements.startCameraBtn.disabled = false;
}

async function analyzeImage() {
  clearError();

  if (!selectedImageData) {
    showError("Carregue ou capture uma imagem antes de iniciar a análise.");
    return;
  }

  if (!isModelConfigured()) {
    showError("O sistema de análise ainda não está disponível. Tente novamente em instantes.");
    showConfigurationResult();
    return;
  }

  if (!model) {
    showError("A análise ainda está sendo preparada. Tente novamente em alguns instantes.");
    return;
  }

  setLoading(true);

  try {
    const predictions = await model.predict(elements.imagePreview);
    const sortedPredictions = predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, maxPredictions || predictions.length);

    if (!sortedPredictions.length) {
      throw new Error("No predictions returned by the model.");
    }

    const topPrediction = sortedPredictions[0];
    currentAnalysisDateTime = new Date().toISOString();
    renderResult(topPrediction, sortedPredictions, currentAnalysisDateTime);
    await saveAnalysis(topPrediction, sortedPredictions, currentAnalysisDateTime);
  } catch (error) {
    showError("Não foi possível analisar esta imagem. Tente usar uma foto mais nítida da folha.");
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function showConfigurationResult() {
  currentAnalysisDateTime = new Date().toISOString();
  elements.resultDashboard.hidden = false;
  elements.emptyResult.hidden = true;
  elements.resultContent.hidden = false;
  elements.dashboardImagePreview.src = selectedImageData || HISTORY_IMAGE_PLACEHOLDER;
  elements.analyzedImageTitle.textContent = getAnalyzedImageTitle();
  elements.analysisDateText.textContent = `Analisado em: ${formatAnalysisDateTime(currentAnalysisDateTime)}`;
  elements.diagnosisName.textContent = "Nome da Doença: Análise indisponível";
  elements.confidenceValue.textContent = "0%";
  elements.confidenceLevelText.textContent = "Baixa Confiança";
  elements.confidenceBar.style.width = "0%";
  elements.severityBadge.textContent = "Indisponível";
  elements.severityBadge.className = "severity-badge";
  elements.resultDescription.textContent = "O recurso de análise automática não está disponível no momento.";
  renderGuidanceList(elements.causesList, ["O sistema de análise automática não retornou um diagnóstico."]);
  renderGuidanceList(elements.treatmentList, ["Tente novamente em instantes ou atualize a página antes de realizar uma nova análise."]);
  renderGuidanceList(elements.preventionList, ["Use uma imagem nítida e mantenha o acompanhamento técnico da planta."]);
  elements.lowConfidenceWarning.hidden = true;
  elements.probabilityList.innerHTML = "";
}

function renderResult(topPrediction, predictions, dateTime = new Date().toISOString()) {
  const confidence = probabilityToPercent(topPrediction.probability);
  const info = getDiseaseInfo(topPrediction.className);

  elements.resultDashboard.hidden = false;
  elements.emptyResult.hidden = true;
  elements.resultContent.hidden = false;
  elements.dashboardImagePreview.src = selectedImageData;
  elements.analyzedImageTitle.textContent = getAnalyzedImageTitle();
  elements.analysisDateText.textContent = `Analisado em: ${formatAnalysisDateTime(dateTime)}`;
  elements.diagnosisName.textContent = `Nome da Doença: ${info.displayName}`;
  elements.confidenceValue.textContent = `${confidence}%`;
  elements.confidenceLevelText.textContent = getConfidenceLabel(confidence);
  elements.confidenceBar.style.width = "0%";
  window.requestAnimationFrame(() => {
    elements.confidenceBar.style.width = `${confidence}%`;
  });
  elements.severityBadge.textContent = `Gravidade ${formatSeverity(info.severity)}`;
  elements.severityBadge.className = `severity-badge ${getSeverityClass(info.severity)}`;
  elements.resultDescription.textContent = info.description;
  renderGuidanceList(elements.causesList, info.causes);
  renderGuidanceList(elements.treatmentList, info.treatment);
  renderGuidanceList(elements.preventionList, info.prevention);
  elements.lowConfidenceWarning.hidden = confidence >= 70;
  renderProbabilities(predictions);
}

function getAnalyzedImageTitle() {
  return selectedImageFileName ? `Folha Analisada: ${selectedImageFileName}` : "Folha Analisada";
}

function getConfidenceLabel(confidence) {
  if (confidence >= 80) return "Alta Confiança";
  if (confidence >= 50) return "Confiança Moderada";
  return "Baixa Confiança";
}

function renderGuidanceList(element, items = []) {
  element.innerHTML = items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
}

function renderProbabilities(predictions) {
  elements.probabilityList.innerHTML = predictions.map((prediction) => {
    const percent = probabilityToPercent(prediction.probability);
    const info = getDiseaseInfo(prediction.className);
    return `
      <div class="probability-item">
        <div class="probability-meta">
          <span>${info.displayName}</span>
          <span>${percent}%</span>
        </div>
        <div class="probability-track">
          <span class="probability-bar" style="width: ${percent}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function getDiseaseInfo(className) {
  const normalizedClass = normalizeClassName(className);
  const matchedKey = Object.keys(DISEASE_INFO).find((key) => {
    const disease = DISEASE_INFO[key];
    return normalizeClassName(key) === normalizedClass || normalizeClassName(disease.displayName) === normalizedClass;
  });

  if (matchedKey) {
    return DISEASE_INFO[matchedKey];
  }

  return {
    displayName: "Condição não identificada",
    description: "A imagem foi analisada, mas a condição retornada ainda não possui informações detalhadas cadastradas.",
    severity: "Média",
    recommendation: "Use uma foto mais nítida e procure orientação técnica caso os sintomas persistam.",
    icon: "fa-solid fa-microscope",
    causes: ["A condição prevista ainda não possui causas cadastradas."],
    treatment: ["Use uma foto mais nítida e procure orientação técnica caso os sintomas persistam."],
    prevention: ["Realize monitoramento periódico e mantenha boas práticas de manejo."]
  };
}

function normalizeClassName(value) {
  return String(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function probabilityToPercent(probability) {
  return Math.round(Number(probability || 0) * 100);
}

function setLoading(isLoading) {
  elements.loadingState.hidden = !isLoading;
  elements.analyzeBtn.disabled = isLoading;
  if (isLoading) {
    elements.resultDashboard.hidden = false;
    elements.emptyResult.hidden = true;
  }
}

function createImageThumbnail(dataUrl, maxWidth = 320, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, maxWidth / image.width);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    image.onerror = () => reject(new Error("Image thumbnail could not be created."));
    image.src = dataUrl;
  });
}

async function saveAnalysis(prediction, predictions = [], dateTime = new Date().toISOString()) {
  const info = getDiseaseInfo(prediction.className);

  try {
    const thumbnail = await createImageThumbnail(selectedImageData);
    const entry = {
      id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
      dateTime,
      predictedClass: info.displayName,
      diseaseDisplayName: info.displayName,
      confidence: probabilityToPercent(prediction.probability),
      image: thumbnail,
      originalFileName: selectedImageFileName,
      description: info.description,
      recommendation: info.recommendation,
      severity: info.severity,
      causes: info.causes,
      treatment: info.treatment,
      prevention: info.prevention,
      probabilities: predictions.map((item) => ({
        className: item.className,
        displayName: getDiseaseInfo(item.className).displayName,
        confidence: probabilityToPercent(item.probability)
      }))
    };

    const history = [entry, ...getHistory()];
    persistHistory(history);
    renderHistory();
    showToast("Análise concluída com sucesso.");
  } catch (error) {
    showToast("A análise foi concluída, mas não foi possível salvar este registro no histórico.");
    console.warn(error);
  }
}

function persistHistory(history) {
  for (let itemLimit = 8; itemLimit >= 1; itemLimit -= 1) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, itemLimit)));
      return;
    } catch (error) {
      if (!isStorageQuotaError(error) || itemLimit === 1) {
        throw error;
      }
    }
  }
}

function isStorageQuotaError(error) {
  return error && (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const history = getNormalizedHistory();
  const searchTerm = normalizeSearchText(elements.historySearchInput.value);
  const filteredHistory = applyHistoryFilter(history, searchTerm);
  renderedHistory = filteredHistory;
  elements.clearHistoryBtn.disabled = history.length === 0;

  if (!history.length) {
    elements.historyList.innerHTML = `
      <div class="history-empty-state">
        <span class="empty-history-icon" aria-hidden="true"><i class="fa-solid fa-folder-open"></i></span>
        <h3>Nenhuma análise salva ainda</h3>
        <p>As análises realizadas aparecerão aqui automaticamente.</p>
        <a class="button button-primary" href="#analysis">
          <i class="fa-solid fa-seedling" aria-hidden="true"></i>
          <span>Fazer Nova Análise</span>
        </a>
      </div>
    `;
    return;
  }

  if (!filteredHistory.length) {
    elements.historyList.innerHTML = `
      <div class="history-empty-state">
        <span class="empty-history-icon" aria-hidden="true"><i class="fa-solid fa-magnifying-glass"></i></span>
        <h3>Nenhuma análise encontrada</h3>
        <p>Nenhum registro corresponde aos filtros aplicados.</p>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = filteredHistory.map((entry, index) => `
    <article class="history-card">
      <img src="${escapeAttribute(entry.image)}" alt="Prévia da análise para ${escapeAttribute(entry.predictedClass)}">
      <div class="history-body">
        <p class="history-date">${escapeHTML(entry.shortDate)}</p>
        <h3>${escapeHTML(entry.predictedClass)}</h3>
        <div class="history-card-meta">
          <span><i class="fa-solid fa-chart-simple" aria-hidden="true"></i> Confiança ${entry.confidence}%</span>
          <span class="history-severity ${getSeverityClass(entry.severity)}">Gravidade ${escapeHTML(formatSeverity(entry.severity))}</span>
        </div>
        <button class="report-link" type="button" data-history-index="${index}">
          <span>Ver Relatório</span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  `).join("");
}

function clearHistory() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todo o histórico de análises?");
  if (!confirmed) return;

  localStorage.removeItem(HISTORY_KEY);
  renderedHistory = [];
  renderHistory();
  showToast("O histórico foi apagado.");
}

function downloadReport() {
  window.print();
}

function resetCurrentAnalysis() {
  selectedImageData = "";
  selectedImageFileName = "";
  currentAnalysisDateTime = "";
  elements.imageInput.value = "";
  elements.imagePreview.removeAttribute("src");
  elements.imagePreview.hidden = true;
  elements.emptyPreview.hidden = false;
  elements.resultDashboard.hidden = true;
  elements.resultContent.hidden = true;
  elements.emptyResult.hidden = false;
  elements.emptyResult.textContent = "Carregue ou capture uma imagem para visualizar a condição prevista, a confiança e a recomendação.";
  elements.probabilityList.innerHTML = "";
  elements.confidenceBar.style.width = "0%";
  stopCamera();
  clearError();
  document.getElementById("analysis").scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(getValidDate(value));
}

function formatShortDate(value) {
  const date = getValidDate(value);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${date.getDate()} de ${formattedMonth}, ${date.getFullYear()}`;
}

function formatAnalysisDateTime(value) {
  const date = getValidDate(value);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
  return `${date.getDate()} de ${formattedMonth} de ${date.getFullYear()}, ${time}`;
}

function getNormalizedHistory() {
  return getHistory().map((entry, index) => normalizeHistoryEntry(entry, index));
}

function normalizeHistoryEntry(entry, index) {
  const predictedClass = entry.diseaseDisplayName || entry.predictedClass || "Classe não identificada";
  const info = getDiseaseInfo(predictedClass);
  const dateTime = entry.dateTime || new Date().toISOString();

  return {
    id: entry.id || `legacy-${index}`,
    dateTime,
    predictedClass: info.displayName,
    diseaseDisplayName: entry.diseaseDisplayName || info.displayName,
    confidence: Number.isFinite(Number(entry.confidence)) ? Number(entry.confidence) : 0,
    image: entry.image || HISTORY_IMAGE_PLACEHOLDER,
    originalFileName: entry.originalFileName || "",
    recommendation: entry.recommendation || info.recommendation || "Recomendação não disponível.",
    severity: entry.severity || info.severity || "Medium",
    description: entry.description || info.description || "Descrição não disponível.",
    causes: Array.isArray(entry.causes) ? entry.causes : info.causes || [],
    treatment: Array.isArray(entry.treatment) ? entry.treatment : info.treatment || [],
    prevention: Array.isArray(entry.prevention) ? entry.prevention : info.prevention || [],
    probabilities: Array.isArray(entry.probabilities) ? entry.probabilities : [],
    icon: info.icon || "fa-solid fa-file-medical",
    shortDate: formatShortDate(dateTime),
    fullDate: formatDate(dateTime)
  };
}

function applyHistoryFilter(history, searchTerm) {
  let records = [...history];

  if (searchTerm) {
    records = records.filter((entry) => {
      const searchableText = normalizeSearchText([
        entry.predictedClass,
        formatSeverity(entry.severity),
        entry.severity,
        entry.recommendation,
        entry.description,
        entry.causes.join(" "),
        entry.treatment.join(" "),
        entry.prevention.join(" "),
        entry.shortDate,
        entry.fullDate
      ].join(" "));
      return searchableText.includes(searchTerm);
    });
  }

  if (activeHistoryFilter === "disease") {
    return records.sort((a, b) => a.predictedClass.localeCompare(b.predictedClass, "pt-BR"));
  }

  if (activeHistoryFilter === "date" || activeHistoryFilter === "all") {
    records.sort((a, b) => getValidDate(b.dateTime) - getValidDate(a.dateTime));
  }

  if (["high", "medium", "low"].includes(activeHistoryFilter)) {
    records = records.filter((entry) => normalizeSeverity(entry.severity) === activeHistoryFilter);
  }

  return records;
}

function toggleHistoryFilterMenu() {
  const nextState = !elements.historyFilterMenu.hidden;
  elements.historyFilterMenu.hidden = nextState;
  elements.historyFilterBtn.setAttribute("aria-expanded", String(!nextState));
}

function handleHistoryFilterSelection(event) {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeHistoryFilter = button.dataset.filter;
  elements.historyFilterMenu.hidden = true;
  elements.historyFilterBtn.setAttribute("aria-expanded", "false");
  renderHistory();
}

function handleHistoryCardClick(event) {
  const button = event.target.closest("[data-history-index]");
  if (!button) return;

  const entry = renderedHistory[Number(button.dataset.historyIndex)];
  if (entry) {
    openReportModal(entry);
  }
}

function openReportModal(entry) {
  elements.reportModalBody.innerHTML = `
    <header class="report-modal-header">
      <span class="report-modal-icon" aria-hidden="true"><i class="fa-solid fa-file-medical"></i></span>
      <div>
        <p class="eyebrow">Relatório da análise</p>
        <h2 id="reportModalTitle">${escapeHTML(entry.predictedClass)}</h2>
      </div>
    </header>
    <img class="report-image" src="${escapeAttribute(entry.image)}" alt="Imagem analisada de ${escapeAttribute(entry.predictedClass)}">
    <div class="report-stats">
      <div>
        <span>Confiança</span>
        <strong>${entry.confidence}%</strong>
      </div>
      <div>
        <span>Gravidade</span>
        <strong>${escapeHTML(formatSeverity(entry.severity))}</strong>
      </div>
      <div>
        <span>Data e hora</span>
        <strong>${escapeHTML(entry.fullDate)}</strong>
      </div>
    </div>
    <section class="report-section">
      <h3>Descrição</h3>
      <p>${escapeHTML(entry.description)}</p>
    </section>
    <section class="report-section report-recommendation">
      <h3><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Recomendação</h3>
      <p>${escapeHTML(entry.recommendation)}</p>
    </section>
    <div class="report-guidance-grid">
      <section class="report-section">
        <h3><i class="fa-solid fa-cloud-rain" aria-hidden="true"></i> Causas</h3>
        ${renderReportList(entry.causes)}
      </section>
      <section class="report-section">
        <h3><i class="fa-solid fa-spray-can-sparkles" aria-hidden="true"></i> Tratamento</h3>
        ${renderReportList(entry.treatment)}
      </section>
      <section class="report-section">
        <h3><i class="fa-solid fa-shield-heart" aria-hidden="true"></i> Prevenção</h3>
        ${renderReportList(entry.prevention)}
      </section>
    </div>
  `;

  elements.reportModal.hidden = false;
  document.body.classList.add("modal-open");
  elements.reportCloseBtn.focus();
}

function renderReportList(items = []) {
  return `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function closeReportModal() {
  elements.reportModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function handleReportModalClick(event) {
  if (event.target.hasAttribute("data-modal-close")) {
    closeReportModal();
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape") {
    if (!elements.reportModal.hidden) {
      closeReportModal();
    }
    if (!elements.historyFilterMenu.hidden) {
      elements.historyFilterMenu.hidden = true;
      elements.historyFilterBtn.setAttribute("aria-expanded", "false");
    }
  }
}

function handleDocumentClick(event) {
  const clickedFilter = elements.historyFilterBtn.contains(event.target) || elements.historyFilterMenu.contains(event.target);
  if (!clickedFilter) {
    elements.historyFilterMenu.hidden = true;
    elements.historyFilterBtn.setAttribute("aria-expanded", "false");
  }
}

function setActiveNavLink(activeLink) {
  elements.navLinks.forEach((link) => link.classList.toggle("is-active", link === activeLink));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function normalizeSeverity(value) {
  const severity = normalizeSearchText(value);
  if (["high", "alta", "alto"].includes(severity)) return "high";
  if (["medium", "media", "medio"].includes(severity)) return "medium";
  if (["low", "baixa", "baixo"].includes(severity)) return "low";
  return "medium";
}

function formatSeverity(value) {
  const severity = normalizeSeverity(value);
  if (severity === "high") return "Alta";
  if (severity === "low") return "Baixa";
  return "Média";
}

function getSeverityClass(value) {
  return `severity-${normalizeSeverity(value)}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.hidden = false;
}

function clearError() {
  elements.errorMessage.textContent = "";
  elements.errorMessage.hidden = true;
}

function showToast(message) {
  elements.appToast.textContent = message;
  elements.appToast.hidden = false;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.appToast.hidden = true;
  }, 3200);
}

window.addEventListener("beforeunload", stopCamera);
