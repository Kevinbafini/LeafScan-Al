const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const CONFIDENCE_MAP = { high: 0.92, medium: 0.68, low: 0.42 };

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
const HISTORY_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 360'%3E%3Crect width='480' height='360' fill='%23edf6e9'/%3E%3Cpath d='M240 95c58 48 87 96 87 145 0 47-35 79-87 79s-87-32-87-79c0-49 29-97 87-145z' fill='%23287a45' opacity='.18'/%3E%3Cpath d='M240 132v150' stroke='%23287a45' stroke-width='12' stroke-linecap='round' opacity='.45'/%3E%3C/svg%3E";

let selectedImageData = "";
let selectedImageFileName = "";
let cameraStream = null;
let activeHistoryFilter = "all";
let renderedHistory = [];
let currentAnalysisDateTime = "";
let historyCache = [];

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  cacheElements();
  renderDiseaseCards();
  setHistoryLoading(true);
  bindEvents();
  bindAuthEvents();
  updateModelStatus();
  initMobileMenu();
  initScrollAnimations();
  initAuth();
});

function cacheElements() {
  // Auth elements
  elements.authOverlay         = document.getElementById("authOverlay");
  elements.authCard            = document.getElementById("authCard");
  elements.authLoadingState    = document.getElementById("authLoadingState");
  elements.authViewLogin       = document.getElementById("authViewLogin");
  elements.authViewRegister    = document.getElementById("authViewRegister");
  elements.authViewForgot      = document.getElementById("authViewForgot");
  elements.authViewReset       = document.getElementById("authViewReset");
  elements.loginForm           = document.getElementById("loginForm");
  elements.registerForm        = document.getElementById("registerForm");
  elements.forgotForm          = document.getElementById("forgotForm");
  elements.resetForm           = document.getElementById("resetForm");
  elements.userSection         = document.getElementById("userSection");
  elements.userAvatar          = document.getElementById("userAvatar");
  elements.userDisplayName     = document.getElementById("userDisplayName");
  elements.logoutBtn           = document.getElementById("logoutBtn");
  elements.mobileLogoutBtn     = document.getElementById("mobileLogoutBtn");
  elements.resetTokenInput     = document.getElementById("resetTokenInput");
  elements.passwordStrengthMeter = document.getElementById("passwordStrengthMeter");
  elements.strengthLabel       = document.getElementById("strengthLabel");
  elements.resetBackLinks      = document.getElementById("resetBackLinks");
  elements.resetSuccessLinks   = document.getElementById("resetSuccessLinks");

  // App elements
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

function updateModelStatus() {
  elements.modelStatusText.innerHTML = '<span class="status-dot" aria-hidden="true"></span>Sistema pronto para análise';
  elements.configurationWarning.classList.add("is-ready");
  elements.configurationWarning.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true" style="color:var(--primary);margin-right:6px"></i><strong>Sistema pronto:</strong> envie uma imagem da folha para iniciar a avaliação com IA (Claude).';
}

function renderDiseaseCards() {
  elements.diseaseGrid.innerHTML = Object.values(DISEASE_INFO).map((disease) => {
    const severityClass = getSeverityClass(disease.severity);
    const severityLabel = formatSeverity(disease.severity);
    return `
      <article class="disease-card">
        <span class="card-icon" aria-hidden="true"><i class="${disease.icon}"></i></span>
        <h3>${disease.displayName}</h3>
        <p>${disease.description}</p>
        <span class="disease-card-severity ${severityClass}">
          <i class="fa-solid fa-circle-dot" aria-hidden="true" style="font-size:0.65rem;margin-right:4px"></i>Gravidade ${escapeHTML(severityLabel)}
        </span>
      </article>
    `;
  }).join("");
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

  if (!SUPPORTED_MIME_TYPES.has(file.type)) {
    showError("Formato não suportado. Use JPG, PNG ou WEBP.");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    showError("Imagem muito grande. O tamanho máximo permitido é 10 MB.");
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

  setLoading(true);

  try {
    const dataUrlMatch = selectedImageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      throw new Error("Formato de imagem inválido.");
    }

    const mimeType = dataUrlMatch[1];
    const imageBase64 = dataUrlMatch[2];

    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType })
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Resposta inesperada do servidor (status ${response.status}). Verifique se o servidor está rodando.`);
    }

    const result = await response.json();

    if (!result.success) {
      if (response.status === 401) {
        throw new Error("Chave de API inválida. Verifique o arquivo .env e reinicie o servidor.");
      }
      if (response.status === 429) {
        throw new Error("Limite de uso da API atingido. Aguarde alguns minutos e tente novamente.");
      }
      if (response.status === 400) {
        throw new Error(result.error || "Imagem inválida ou tipo não suportado.");
      }
      throw new Error(result.error || "A análise retornou um erro desconhecido.");
    }

    const { analysis } = result;
    currentAnalysisDateTime = new Date().toISOString();
    renderResult(analysis, currentAnalysisDateTime);
    await saveAnalysis(analysis, currentAnalysisDateTime);
  } catch (error) {
    const isNetworkError = error instanceof TypeError;
    showError(
      isNetworkError
        ? "Não foi possível conectar ao servidor. Verifique se o servidor está rodando com 'npm run dev'."
        : `Não foi possível analisar esta imagem: ${error.message}`
    );
    console.error(error);
  } finally {
    setLoading(false);
  }
}

function getConfidenceFromAnalysis(analysis) {
  if (typeof analysis.confidenceScore === "number" && analysis.confidenceScore > 0) {
    return Math.min(90, Math.max(0, Math.round(analysis.confidenceScore)));
  }
  return probabilityToPercent(CONFIDENCE_MAP[analysis.confidenceLevel] ?? 0.50);
}

function renderResult(analysis, dateTime = new Date().toISOString()) {
  const confidence = getConfidenceFromAnalysis(analysis);
  const confidenceLabelMap = { high: "Alta", medium: "Média", low: "Baixa" };
  const confidenceLabel = confidenceLabelMap[analysis.confidenceLevel] || "Média";
  const diseaseName = analysis.diseaseName || analysis.classification || "—";

  elements.resultDashboard.hidden = false;
  elements.emptyResult.hidden = true;
  elements.resultContent.hidden = false;
  elements.dashboardImagePreview.src = selectedImageData;
  elements.analyzedImageTitle.textContent = getAnalyzedImageTitle();
  elements.analysisDateText.textContent = `Analisado em: ${formatAnalysisDateTime(dateTime)}`;
  elements.diagnosisName.textContent = `Diagnóstico: ${diseaseName}`;
  elements.confidenceValue.textContent = `${confidence}%`;
  elements.confidenceLevelText.textContent = getConfidenceLabel(confidence);
  elements.confidenceBar.style.width = "0%";
  window.requestAnimationFrame(() => {
    elements.confidenceBar.style.width = `${confidence}%`;
  });
  elements.severityBadge.textContent = `Confiança ${confidenceLabel}`;
  elements.severityBadge.className = `severity-badge ${getSeverityClass(confidenceLabel)}`;
  elements.resultDescription.textContent = analysis.details || analysis.summary || "";
  renderGuidanceList(elements.causesList, Array.isArray(analysis.visibleSigns) ? analysis.visibleSigns : []);
  renderGuidanceList(elements.treatmentList, analysis.recommendation ? [analysis.recommendation] : []);
  renderGuidanceList(elements.preventionList, analysis.disclaimer ? [analysis.disclaimer] : []);
  elements.lowConfidenceWarning.hidden = confidence >= 70;

  const alternatives = Array.isArray(analysis.alternativeDiagnoses) ? analysis.alternativeDiagnoses : [];
  elements.probabilityList.innerHTML = `
    <div class="probability-item">
      <div class="probability-meta">
        <span><strong>${escapeHTML(diseaseName)}</strong></span>
        <span>${confidence}%</span>
      </div>
      <div class="probability-track">
        <span class="probability-bar" style="width: ${confidence}%"></span>
      </div>
    </div>
    ${alternatives.map((alt) => `
      <div class="probability-item">
        <div class="probability-meta">
          <span>${escapeHTML(alt.name || "")}</span>
          <span class="alt-label">Alternativa</span>
        </div>
        ${alt.reason ? `<p class="alt-reason">${escapeHTML(alt.reason)}</p>` : ""}
      </div>
    `).join("")}
  `;

  const fallbackBadge = document.getElementById("fallbackBadge");
  if (fallbackBadge) {
    fallbackBadge.hidden = !analysis.fallback;
  }
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

async function saveAnalysis(analysis, dateTime = new Date().toISOString()) {
  const displayName = analysis.diseaseName || analysis.title || analysis.classification || "Análise concluída";
  const confidence = getConfidenceFromAnalysis(analysis);
  const confidenceLabelMap = { high: "Alta", medium: "Média", low: "Baixa" };
  const severityLabel = confidenceLabelMap[analysis.confidenceLevel] || "Média";

  try {
    const thumbnail = await createImageThumbnail(selectedImageData);
    const entry = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
      dateTime,
      predictedClass: displayName,
      diseaseDisplayName: displayName,
      confidence,
      image: thumbnail,
      originalFileName: selectedImageFileName,
      description: analysis.details || analysis.summary || "",
      recommendation: analysis.recommendation || "",
      severity: severityLabel,
      causes: Array.isArray(analysis.visibleSigns) ? analysis.visibleSigns : [],
      treatment: analysis.recommendation ? [analysis.recommendation] : [],
      prevention: analysis.disclaimer ? [analysis.disclaimer] : [],
      probabilities: [{
        className: analysis.classification || displayName,
        displayName,
        confidence
      }],
      fallback: analysis.fallback || false
    };

    const response = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });

    if (response.ok) {
      const data = await response.json();
      historyCache = [data.entry || entry, ...historyCache];
      renderHistory();
      showToast(analysis.fallback ? "Análise demonstrativa concluída." : "Análise concluída com sucesso.");
    } else {
      showToast("A análise foi concluída, mas não foi possível salvar este registro no histórico.");
    }
  } catch (error) {
    showToast("A análise foi concluída, mas não foi possível salvar este registro no histórico.");
    console.warn(error);
  }
}

function getHistory() {
  return historyCache;
}

async function loadHistory() {
  try {
    const response = await fetch("/api/history");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    historyCache = Array.isArray(data.history) ? data.history : [];
  } catch (error) {
    console.warn("[LeafScan] Não foi possível carregar o histórico:", error.message);
    historyCache = [];
    renderHistoryError();
    return;
  }
  renderHistory();
}

async function migrateLocalStorage() {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return;

  let entries;
  try {
    entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) {
      localStorage.removeItem(HISTORY_KEY);
      return;
    }
  } catch {
    localStorage.removeItem(HISTORY_KEY);
    return;
  }

  try {
    const response = await fetch("/api/history/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });
    if (response.ok) {
      localStorage.removeItem(HISTORY_KEY);
    }
  } catch (error) {
    console.warn("[LeafScan] Migração do localStorage falhou:", error.message);
  }
}

function setHistoryLoading(isLoading) {
  if (!isLoading) return;
  elements.historyList.innerHTML = `
    <div class="history-empty-state">
      <span class="empty-history-icon" aria-hidden="true"><i class="fa-solid fa-spinner fa-spin"></i></span>
      <p>Carregando histórico...</p>
    </div>
  `;
  elements.clearHistoryBtn.disabled = true;
}

function renderHistoryError() {
  elements.historyList.innerHTML = `
    <div class="history-empty-state">
      <span class="empty-history-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></span>
      <h3>Não foi possível carregar o histórico</h3>
      <p>Verifique a conexão com o banco de dados e recarregue a página.</p>
    </div>
  `;
  elements.clearHistoryBtn.disabled = true;
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
      <button class="card-delete-btn" type="button" data-delete-index="${index}" aria-label="Excluir análise">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
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

async function clearHistory() {
  const confirmed = window.confirm("Tem certeza que deseja apagar todo o histórico de análises?");
  if (!confirmed) return;

  try {
    const response = await fetch("/api/history", { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    historyCache = [];
    renderedHistory = [];
    renderHistory();
    showToast("O histórico foi apagado.");
  } catch (error) {
    showToast("Não foi possível apagar o histórico.");
    console.error(error);
  }
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
  const storedName = entry.diseaseDisplayName || entry.predictedClass || "Classe não identificada";
  const info = getDiseaseInfo(storedName);
  const isKnownDisease = info.displayName !== "Condição não identificada";
  const displayName = isKnownDisease ? info.displayName : storedName;
  const dateTime = entry.dateTime || new Date().toISOString();

  return {
    id: entry.id || `legacy-${index}`,
    _originalIndex: index,
    dateTime,
    predictedClass: displayName,
    diseaseDisplayName: displayName,
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
  const deleteBtn = event.target.closest("[data-delete-index]");
  if (deleteBtn) {
    const entry = renderedHistory[Number(deleteBtn.dataset.deleteIndex)];
    if (entry) deleteHistoryEntry(entry);
    return;
  }

  const button = event.target.closest("[data-history-index]");
  if (!button) return;

  const entry = renderedHistory[Number(button.dataset.historyIndex)];
  if (entry) {
    openReportModal(entry);
  }
}

async function deleteHistoryEntry(entry) {
  const confirmed = window.confirm("Excluir esta análise do histórico?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/history/${encodeURIComponent(entry.id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    historyCache = historyCache.filter((e) => e.id !== entry.id);
    renderHistory();
    showToast("Análise excluída do histórico.");
  } catch (error) {
    showToast("Não foi possível excluir esta análise.");
    console.error(error);
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
        <h3><i class="fa-solid fa-eye" aria-hidden="true"></i> Sinais Visíveis</h3>
        ${renderReportList(entry.causes)}
      </section>
      <section class="report-section">
        <h3><i class="fa-solid fa-stethoscope" aria-hidden="true"></i> Recomendação</h3>
        ${renderReportList(entry.treatment)}
      </section>
      <section class="report-section">
        <h3><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Aviso</h3>
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
    if (elements.mobileMenu && !elements.mobileMenu.hidden) {
      closeMobileMenu();
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
    .replace(/[̀-ͯ]/g, "")
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
  const toast = elements.appToast;
  toast.textContent = message;
  toast.classList.remove("is-hiding", "is-visible");
  toast.hidden = false;
  void toast.offsetWidth;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.replace("is-visible", "is-hiding");
    window.setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove("is-hiding");
    }, 240);
  }, 3000);
}

window.addEventListener("beforeunload", stopCamera);

/* ===== THEME MANAGEMENT ===== */

const THEME_KEY = "leafscan-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  applyTheme(theme);

  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.addEventListener("click", toggleTheme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.setAttribute("aria-label", theme === "dark" ? "Alternar para tema claro" : "Alternar para tema escuro");
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

/* ===== MOBILE MENU ===== */

function initMobileMenu() {
  elements.hamburgerBtn = document.getElementById("hamburgerBtn");
  elements.mobileMenu = document.getElementById("mobileMenu");

  if (!elements.hamburgerBtn || !elements.mobileMenu) return;

  elements.hamburgerBtn.addEventListener("click", toggleMobileMenu);

  elements.mobileMenu.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", () => closeMobileMenu());
  });
}

function toggleMobileMenu() {
  if (elements.mobileMenu.hidden) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
}

function openMobileMenu() {
  elements.mobileMenu.hidden = false;
  elements.hamburgerBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  elements.mobileMenu.hidden = true;
  elements.hamburgerBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

/* ===== SCROLL REVEAL ANIMATIONS ===== */

function initScrollAnimations() {
  if (typeof IntersectionObserver === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = [
    document.querySelector(".intro-section"),
    document.querySelector("#diseases .section-heading"),
    document.querySelector("#diseases .disease-grid"),
    document.querySelector(".how-it-works"),
    document.querySelector(".history-panel")
  ].filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -48px 0px" });

  targets.forEach((el) => {
    el.classList.add("section-reveal");
    observer.observe(el);
  });
}

/* ===== AUTH ===== */

let currentUser = null;

async function initAuth() {
  // If URL contains ?action=reset&token=..., go straight to reset view
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");
  const resetToken = params.get("token");

  if (action === "reset" && resetToken) {
    showAuthCard("reset");
    elements.resetTokenInput.value = resetToken;
    // Clean token from URL without reloading
    history.replaceState(null, "", window.location.pathname);
    return;
  }

  // Check existing session
  try {
    const res = await fetch("/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        setAuthenticatedState(data.user);
        return;
      }
    }
  } catch {
    // Network error — fall through to login screen
  }

  showAuthCard("login");
}

function setAuthenticatedState(user) {
  currentUser = user;

  // Update header user section
  if (elements.userAvatar) {
    elements.userAvatar.textContent = user.name.charAt(0).toUpperCase();
  }
  if (elements.userDisplayName) {
    elements.userDisplayName.textContent = user.name;
  }
  if (elements.userSection) elements.userSection.hidden = false;
  if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.hidden = false;

  // Hide overlay, show app
  if (elements.authOverlay) elements.authOverlay.hidden = true;
  document.body.classList.remove("not-authenticated");
  document.body.classList.add("authenticated");

  // Load history and run localStorage migration after auth is confirmed
  migrateLocalStorage().then(() => loadHistory()).catch(() => loadHistory());
}

function showAuthCard(view) {
  if (elements.authLoadingState) elements.authLoadingState.hidden = true;
  if (elements.authCard) elements.authCard.hidden = false;
  if (elements.authOverlay) elements.authOverlay.hidden = false;
  document.body.classList.add("not-authenticated");
  document.body.classList.remove("authenticated");
  switchAuthView(view);
}

function switchAuthView(view) {
  const viewMap = {
    login:    elements.authViewLogin,
    register: elements.authViewRegister,
    forgot:   elements.authViewForgot,
    reset:    elements.authViewReset
  };

  Object.entries(viewMap).forEach(([name, el]) => {
    if (el) el.hidden = (name !== view);
  });

  // Focus first input in the active view for accessibility
  const active = viewMap[view];
  if (active) {
    const firstInput = active.querySelector("input:not([type=hidden])");
    if (firstInput) requestAnimationFrame(() => firstInput.focus());
  }
}

// ─── Auth view navigation ─────────────────────────────────────────────────────

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-goto-auth]");
  if (!btn) return;
  clearAllAuthBanners();
  switchAuthView(btn.dataset.gotoAuth);
});

// ─── Password show/hide toggle ────────────────────────────────────────────────

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-toggle-password]");
  if (!btn) return;
  const input = document.getElementById(btn.dataset.togglePassword);
  if (!input) return;
  const isShowing = input.type === "text";
  input.type = isShowing ? "password" : "text";
  const icon = btn.querySelector("i");
  if (icon) {
    icon.className = isShowing ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
  }
  btn.setAttribute("aria-label", isShowing ? "Mostrar senha" : "Ocultar senha");
});

// ─── Auth event bindings (called from DOMContentLoaded after cacheElements) ───

function bindAuthEvents() {

// ─── Password strength meter ──────────────────────────────────────────────────

const registerPasswordInput = document.getElementById("registerPassword");
if (registerPasswordInput) {
  registerPasswordInput.addEventListener("input", () => {
    const val = registerPasswordInput.value;
    if (!val) {
      if (elements.passwordStrengthMeter) elements.passwordStrengthMeter.hidden = true;
      return;
    }
    if (elements.passwordStrengthMeter) elements.passwordStrengthMeter.hidden = false;
    const level = calcPasswordStrength(val);
    renderStrengthMeter(level);
  });
}

function calcPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  // Clamp to 1–4
  return Math.min(4, Math.max(1, Math.ceil(score * 4 / 5)));
}

function renderStrengthMeter(level) {
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  const classes = ["", "strength-weak", "strength-fair", "strength-good", "strength-strong"];

  document.querySelectorAll(".strength-segment").forEach((seg) => {
    const segLevel = Number(seg.dataset.level);
    seg.className = "strength-segment";
    if (segLevel <= level) seg.classList.add(classes[level]);
  });

  if (elements.strengthLabel) {
    elements.strengthLabel.textContent = labels[level] || "";
    elements.strengthLabel.className = `strength-label ${classes[level]}`;
  }
}

// ─── Login form ───────────────────────────────────────────────────────────────

if (elements.loginForm) {
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors("login");
    hideBanner("loginFormError");

    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("loginEmailError", "Informe um e-mail válido.");
      valid = false;
    }
    if (!password) {
      setFieldError("loginPasswordError", "Informe sua senha.");
      valid = false;
    }
    if (!valid) return;

    setAuthSubmitting("loginSubmitBtn", true);

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        setAuthenticatedState(data.user);
        showToast(`Bem-vindo, ${data.user.name}!`);
      } else {
        showBanner("loginFormError", data.error || "Falha no login. Verifique suas credenciais.");
      }
    } catch {
      showBanner("loginFormError", "Erro de conexão. Verifique se o servidor está em execução.");
    } finally {
      setAuthSubmitting("loginSubmitBtn", false);
    }
  });
}

// ─── Register form ────────────────────────────────────────────────────────────

if (elements.registerForm) {
  elements.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors("register");
    hideBanner("registerFormError");

    const name            = document.getElementById("registerName").value.trim();
    const email           = document.getElementById("registerEmail").value.trim();
    const password        = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirm").value;

    let valid = true;
    if (!name || name.length < 2) {
      setFieldError("registerNameError", "Nome deve ter pelo menos 2 caracteres.");
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("registerEmailError", "Informe um e-mail válido.");
      valid = false;
    }
    if (!password || password.length < 8) {
      setFieldError("registerPasswordError", "Senha deve ter pelo menos 8 caracteres.");
      valid = false;
    }
    if (password !== confirmPassword) {
      setFieldError("registerConfirmError", "As senhas não coincidem.");
      valid = false;
    }
    if (!valid) return;

    setAuthSubmitting("registerSubmitBtn", true);

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success) {
        setAuthenticatedState(data.user);
        showToast(`Conta criada com sucesso! Bem-vindo, ${data.user.name}!`);
      } else if (data.errors) {
        Object.entries(data.errors).forEach(([field, msg]) => {
          const idMap = { name: "registerNameError", email: "registerEmailError", password: "registerPasswordError" };
          if (idMap[field]) setFieldError(idMap[field], msg);
        });
      } else {
        showBanner("registerFormError", data.error || "Erro ao criar conta. Tente novamente.");
      }
    } catch {
      showBanner("registerFormError", "Erro de conexão. Verifique se o servidor está em execução.");
    } finally {
      setAuthSubmitting("registerSubmitBtn", false);
    }
  });
}

// ─── Forgot password form ─────────────────────────────────────────────────────

if (elements.forgotForm) {
  elements.forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors("forgot");
    hideBanner("forgotFormError");
    hideBanner("forgotFormSuccess");

    const email = document.getElementById("forgotEmail").value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("forgotEmailError", "Informe um e-mail válido.");
      return;
    }

    setAuthSubmitting("forgotSubmitBtn", true);

    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        showBanner("forgotFormSuccess", data.message || "Se este e-mail estiver cadastrado, você receberá as instruções em breve.");
        document.getElementById("forgotEmail").value = "";
        document.getElementById("forgotSubmitBtn").disabled = true;
      } else {
        showBanner("forgotFormError", data.error || "Erro ao processar solicitação. Tente novamente.");
      }
    } catch {
      showBanner("forgotFormError", "Erro de conexão. Verifique se o servidor está em execução.");
    } finally {
      setAuthSubmitting("forgotSubmitBtn", false);
    }
  });
}

// ─── Reset password form ──────────────────────────────────────────────────────

if (elements.resetForm) {
  elements.resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors("reset");
    hideBanner("resetFormError");
    hideBanner("resetFormSuccess");

    const token           = elements.resetTokenInput ? elements.resetTokenInput.value.trim() : "";
    const password        = document.getElementById("resetPassword").value;
    const confirmPassword = document.getElementById("resetConfirm").value;

    let valid = true;
    if (!token) {
      showBanner("resetFormError", "Token inválido. Solicite um novo link de recuperação.");
      valid = false;
    }
    if (!password || password.length < 8) {
      setFieldError("resetPasswordError", "Senha deve ter pelo menos 8 caracteres.");
      valid = false;
    }
    if (password !== confirmPassword) {
      setFieldError("resetConfirmError", "As senhas não coincidem.");
      valid = false;
    }
    if (!valid) return;

    setAuthSubmitting("resetSubmitBtn", true);

    try {
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const data = await res.json();

      if (data.success) {
        showBanner("resetFormSuccess", data.message || "Senha redefinida com sucesso!");
        elements.resetForm.hidden = true;
        if (elements.resetBackLinks) elements.resetBackLinks.hidden = true;
        if (elements.resetSuccessLinks) elements.resetSuccessLinks.hidden = false;
      } else {
        showBanner("resetFormError", data.error || "Erro ao redefinir senha. Solicite um novo link.");
      }
    } catch {
      showBanner("resetFormError", "Erro de conexão. Verifique se o servidor está em execução.");
    } finally {
      setAuthSubmitting("resetSubmitBtn", false);
    }
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

async function logout() {
  try {
    await fetch("/auth/logout", { method: "POST" });
  } catch {
    // Session will be invalidated server-side regardless
  }
  currentUser = null;
  if (elements.userSection) elements.userSection.hidden = true;
  if (elements.mobileLogoutBtn) elements.mobileLogoutBtn.hidden = true;
  closeMobileMenu();
  historyCache = [];
  renderHistory();
  showAuthCard("login");
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", logout);
}
if (elements.mobileLogoutBtn) {
  elements.mobileLogoutBtn.addEventListener("click", logout);
}

} // end bindAuthEvents

// ─── Auth UI helpers ──────────────────────────────────────────────────────────

function setAuthSubmitting(btnId, isSubmitting) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isSubmitting;
  const label   = btn.querySelector(".btn-label");
  const spinner = btn.querySelector(".btn-spinner");
  if (label)   label.hidden   = isSubmitting;
  if (spinner) spinner.hidden = !isSubmitting;
}

function setFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.hidden = false;
    const input = el.closest(".form-group")?.querySelector(".form-input");
    if (input) input.classList.add("is-invalid");
  }
}

function clearFieldErrors(prefix) {
  document.querySelectorAll(`[id^="${prefix}"][id$="Error"]`).forEach((el) => {
    el.textContent = "";
    el.hidden = false; // keep in DOM so aria-live picks it up; text is empty
    const input = el.closest(".form-group")?.querySelector(".form-input");
    if (input) input.classList.remove("is-invalid");
  });
}

function showBanner(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function hideBanner(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.hidden = true;
}

function clearAllAuthBanners() {
  ["loginFormError", "registerFormError", "forgotFormError", "forgotFormSuccess",
   "resetFormError", "resetFormSuccess"].forEach(hideBanner);
}
