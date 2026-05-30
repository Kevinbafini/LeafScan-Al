const express = require("express");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_MODEL = (process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest").trim();
const DEMO_FALLBACK_ENABLED = process.env.DEMO_FALLBACK_ENABLED === "true";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const SUPPORTED_DISEASES = [
  "Folha Saudável",
  "Cancro Cítrico",
  "Mancha Preta",
  "Greening dos Citros",
  "Melanose",
  "Antracnose",
  "Folha Seca",
  "Deficiência Nutricional",
  "Fumagina"
];

const GENERIC_LABEL_MAP = {
  "possível deficiência nutricional ou estresse ambiental": "Deficiência Nutricional",
  "deficiência nutricional ou estresse ambiental": "Deficiência Nutricional",
  "estresse ambiental": "Folha Seca",
  "estresse hídrico": "Folha Seca",
  "queimadura solar": "Folha Seca",
  "danos por pragas": "Folha Seca",
  "imagem não compatível": "Folha Seca",
  "doença não identificada": "Folha Seca",
  "doença foliar": "Mancha Preta",
  "lesões e manchas": "Mancha Preta",
  "folha com manchas": "Mancha Preta",
  "análise visual com lesões": "Mancha Preta",
  "possível doença": "Mancha Preta",
  "mancha bacteriana": "Cancro Cítrico",
  "cercosporiose": "Mancha Preta",
  "septoriose": "Mancha Preta",
  "ferrugem": "Antracnose",
  "oídio": "Antracnose",
  "míldio": "Antracnose",
  "clorose": "Deficiência Nutricional",
  "greening": "Greening dos Citros",
  "huanglongbing": "Greening dos Citros",
  "hlb": "Greening dos Citros",
  "fumagina (sooty mold)": "Fumagina",
  "black spot": "Mancha Preta",
  "anthracnose": "Antracnose",
  "citrus canker": "Cancro Cítrico",
  "nutrient deficiency": "Deficiência Nutricional",
  "sooty mold": "Fumagina",
  "dry leaf": "Folha Seca",
  "healthy leaf": "Folha Saudável"
};

const ANALYSIS_PROMPT = `Você é LeafScan AI, um classificador visual de doenças em folhas de citros/plantas para uma demonstração.

Sua tarefa é classificar a imagem enviada em EXATAMENTE UMA das seguintes classes suportadas:

- Folha Saudável
- Cancro Cítrico
- Mancha Preta
- Greening dos Citros
- Melanose
- Antracnose
- Folha Seca
- Deficiência Nutricional
- Fumagina

NÃO crie nenhum outro rótulo de doença principal. O campo diseaseName DEVE ser exatamente uma dessas 9 classes.

Definições visuais de cada classe:

1. Folha Saudável: coloração verde uniforme, sem lesões, sem manchas escuras, sem halos amarelos, sem camada escura, sem ressecamento severo, sem deformação forte.

2. Cancro Cítrico: lesões elevadas e corticosas, manchas marrons/bege com halo amarelo, lesões em forma de cratera ou sarna, geralmente circulares e de textura rugosa. Prefira esta classe quando as lesões parecem elevadas, corticosas e com halo.

3. Mancha Preta: manchas pretas ou marrom-escuras, lesões necróticas circulares ou irregulares, halos amarelos ao redor das manchas escuras, lesões planas e escuras na superfície. Prefira esta classe quando o sintoma dominante são manchas pretas/escuras ou lesões necróticas escuras com amarelecimento ao redor. SE a imagem apresentar manchas escuras com halos amarelos e NÃO mostrar claramente textura elevada/corticosa, classifique como Mancha Preta e NÃO como Deficiência Nutricional.

4. Greening dos Citros: mosqueamento irregular amarelo, clorose assimétrica, padrão amarelo-verde irregular. Prefira quando o principal sintoma for amarelecimento irregular e não manchas necróticas escuras.

5. Melanose: muitas pequenas manchas escuras ásperas, lesões semelhantes a areia ou pimenta, pequenas marcas escuras elevadas e numerosas. Prefira quando há muitas pequenas manchas ásperas escuras.

6. Antracnose: áreas necróticas marrons, tecido morto irregular, lesões podem se expandir a partir das bordas ou pontas, manchas marrons escuras afundadas. Prefira quando a necrose é ampla, irregular e não principalmente manchas pretas circulares.

7. Folha Seca: grandes áreas marrons secas, tecido ressecado ou queimado, ressecamento das bordas, folha murcha ou morta. Prefira quando o sintoma dominante é ressecamento, não manchas.

8. Deficiência Nutricional: amarelecimento geral ou clorose, folhas verde-pálidas, perda de cor sem manchas necróticas claras, amarelecimento entre nervuras. Prefira SOMENTE quando não há manchas necróticas escuras dominantes e o sintoma principal é amarelecimento do tipo nutricional.

9. Fumagina: camada preta superficial semelhante a fuligem espalhada na superfície da folha, parece poeira preta, fuligem ou mofo sobre a folha.

REGRAS CRÍTICAS DE DECISÃO:
- Manchas escuras planas + halos amarelos = Mancha Preta
- Lesões elevadas corticosas em cratera + halos amarelos = Cancro Cítrico
- Muitas pequenas manchas ásperas escuras = Melanose
- Grandes manchas necróticas irregulares marrons mortas = Antracnose
- Amarelecimento irregular sem manchas necróticas = Greening dos Citros
- Amarelecimento/clorose geral sem manchas = Deficiência Nutricional
- Ressecamento dominante sem manchas = Folha Seca
- Camada de fuligem preta superficial = Fumagina
- Folha verde uniforme saudável = Folha Saudável
- NÃO classifique manchas necróticas escuras como Deficiência Nutricional.

Use Português do Brasil em todos os campos de texto.

Retorne APENAS um objeto JSON válido. Sem markdown. Sem texto fora do JSON.

Esquema JSON:
{
  "title": "Diagnóstico: <uma classe suportada>",
  "summary": "Resumo curto em Português do Brasil",
  "diseaseName": "<exatamente uma classe suportada>",
  "classification": "<exatamente uma classe suportada>",
  "confidenceLevel": "low | medium | high",
  "confidenceScore": 0,
  "alternativeDiagnoses": [
    {
      "name": "<exatamente uma classe suportada>",
      "reason": "Por que esta classe também é possível"
    }
  ],
  "visibleSigns": ["sinal visível 1", "sinal visível 2", "sinal visível 3"],
  "reasoning": "Explique em Português do Brasil por que a classe escolhida corresponde melhor aos sintomas visíveis.",
  "details": "Explicação detalhada em Português do Brasil.",
  "recommendation": "Próximo passo prático em Português do Brasil.",
  "disclaimer": "Análise visual assistida por IA para demonstração. Não substitui avaliação de um especialista agrícola."
}

Regras adicionais:
- diseaseName deve ser exatamente uma das 9 classes suportadas.
- classification deve ser exatamente uma das 9 classes suportadas.
- alternativeDiagnoses pode conter apenas classes suportadas.
- NÃO use rótulos genéricos como "Lesões e manchas", "Estresse ambiental", "Doença foliar" ou "Possível doença".
- confidenceScore entre 0 e 90. Alta confiança = 80-90. Média = 55-75. Baixa = 30-50.
- Se a qualidade da imagem for ruim, escolha a classe mais próxima com confiança baixa.
- Se a imagem não mostrar claramente uma folha, use confiança baixa e a classe mais próxima possível.`;

const DEMO_FALLBACK_RESPONSE = {
  title: "Diagnóstico: Folha Seca",
  summary: "A análise visual identificou possíveis sinais de ressecamento na folha, com alterações na coloração e textura.",
  diseaseName: "Folha Seca",
  classification: "Folha Seca",
  confidenceLevel: "medium",
  confidenceScore: 60,
  alternativeDiagnoses: [
    { name: "Deficiência Nutricional", reason: "O amarelecimento pode indicar desequilíbrio nutricional associado ao ressecamento." }
  ],
  visibleSigns: [
    "Bordas da folha com aspecto ressecado",
    "Coloração amarronzada nas extremidades",
    "Tecido com aspecto queimado ou desidratado"
  ],
  reasoning: "Os sinais de ressecamento nas bordas e a coloração marrom são consistentes com estresse hídrico ou dano por calor.",
  details: "Os padrões visuais observados são consistentes com ressecamento por deficiência hídrica ou exposição excessiva ao calor.",
  recommendation: "Verifique a frequência de irrigação, a drenagem do solo e as condições de exposição solar da planta.",
  disclaimer: "Análise visual assistida por IA para demonstração. Não substitui avaliação de um especialista agrícola.",
  fallback: true
};

function resolveSupportedDisease(rawName) {
  if (!rawName) return null;
  const name = String(rawName).trim();

  if (SUPPORTED_DISEASES.includes(name)) return name;

  const lower = name.toLowerCase();
  const mapped = GENERIC_LABEL_MAP[lower];
  if (mapped) return mapped;

  const partialMatch = SUPPORTED_DISEASES.find((d) => lower.includes(d.toLowerCase()) || d.toLowerCase().includes(lower));
  if (partialMatch) return partialMatch;

  return null;
}

const DARK_SPOT_PATTERN = /mancha(s)? (preta|escura|negra)|lesão (preta|escura|necrótica)|lesões (pretas|escuras|necróticas)|halo(s)? amarelo|mancha(s)? necrótica|black spot|necrose|necrotic/i;

function normalizeAnalysis(raw) {
  const fallbackScores = { high: 85, medium: 65, low: 40 };

  let diseaseName = resolveSupportedDisease(raw.diseaseName) ||
    resolveSupportedDisease(raw.classification) ||
    "Folha Seca";

  const signsText = [
    ...(Array.isArray(raw.visibleSigns) ? raw.visibleSigns : []),
    raw.reasoning || "",
    raw.summary || ""
  ].join(" ");

  if (diseaseName === "Deficiência Nutricional" && DARK_SPOT_PATTERN.test(signsText)) {
    const altNames = Array.isArray(raw.alternativeDiagnoses) ? raw.alternativeDiagnoses.map((a) => a.name) : [];
    const spotOverride = ["Mancha Preta", "Cancro Cítrico", "Melanose", "Antracnose"]
      .find((d) => altNames.some((n) => resolveSupportedDisease(n) === d));
    diseaseName = spotOverride || "Mancha Preta";
  }

  let confidenceScore = Number(raw.confidenceScore);
  if (!Number.isFinite(confidenceScore) || confidenceScore <= 0) {
    confidenceScore = fallbackScores[raw.confidenceLevel] || 50;
  }
  confidenceScore = Math.min(90, Math.max(0, Math.round(confidenceScore)));

  const confidenceLevel = ["low", "medium", "high"].includes(raw.confidenceLevel) ? raw.confidenceLevel : "medium";

  const alternativeDiagnoses = (Array.isArray(raw.alternativeDiagnoses) ? raw.alternativeDiagnoses : [])
    .map((alt) => ({ ...alt, name: resolveSupportedDisease(alt.name) || alt.name }))
    .filter((alt) => SUPPORTED_DISEASES.includes(alt.name) && alt.name !== diseaseName);

  return {
    ...raw,
    diseaseName,
    title: `Diagnóstico: ${diseaseName}`,
    classification: diseaseName,
    confidenceLevel,
    confidenceScore,
    alternativeDiagnoses,
    visibleSigns: Array.isArray(raw.visibleSigns) ? raw.visibleSigns : [],
    summary: raw.summary || "",
    reasoning: raw.reasoning || "",
    details: raw.details || raw.summary || "",
    recommendation: raw.recommendation || "",
    disclaimer: raw.disclaimer || "Análise visual assistida por IA para demonstração. Não substitui avaliação de um especialista agrícola."
  };
}

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname)));

app.get("/api/health", (_req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  res.json({
    ok: true,
    provider: "anthropic",
    anthropicKeyConfigured: Boolean(apiKey),
    model: ANTHROPIC_MODEL
  });
});

app.post("/api/analyze-image", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({
      success: false,
      error: "Os campos imageBase64 e mimeType são obrigatórios."
    });
  }

  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    return res.status(400).json({
      success: false,
      error: "Tipo de imagem não suportado. Use JPG, PNG ou WEBP."
    });
  }

  const imageBytes = Buffer.from(imageBase64, "base64").length;
  if (imageBytes > MAX_IMAGE_BYTES) {
    return res.status(400).json({
      success: false,
      error: "Imagem muito grande. O tamanho máximo permitido é 10 MB."
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error("[LeafScan] ANTHROPIC_API_KEY não está definida no ambiente.");
    return res.status(500).json({
      success: false,
      error: "Chave de API não configurada. Defina ANTHROPIC_API_KEY no arquivo .env."
    });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64
              }
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT
            }
          ]
        }
      ]
    });

    const rawText = message.content[0]?.text ?? "";

    let analysis;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      console.error("[LeafScan] Falha ao processar resposta do Claude. Início do texto:", rawText.slice(0, 200));
      return res.status(502).json({
        success: false,
        error: "Não foi possível processar a resposta da análise. Tente novamente."
      });
    }

    return res.json({ success: true, analysis: normalizeAnalysis(analysis) });
  } catch (error) {
    const status = error?.status;

    if (status === 401) {
      console.error("[LeafScan] Anthropic: chave de API inválida ou sem permissão.");
      return res.status(401).json({
        success: false,
        error: "Chave de API inválida. Verifique ANTHROPIC_API_KEY no arquivo .env."
      });
    }

    if (status === 403) {
      console.error("[LeafScan] Anthropic: permissão negada ou problema de faturamento.");
      if (DEMO_FALLBACK_ENABLED) {
        console.log("[LeafScan] Modo demonstração ativo: retornando resposta simulada.");
        return res.json({ success: true, analysis: DEMO_FALLBACK_RESPONSE });
      }
      return res.status(403).json({
        success: false,
        error: "Acesso negado. Verifique as permissões ou o faturamento da sua conta Anthropic."
      });
    }

    if (status === 429) {
      console.error("[LeafScan] Anthropic: limite de cota ou taxa de requisições excedido.");
      if (DEMO_FALLBACK_ENABLED) {
        console.log("[LeafScan] Modo demonstração ativo: retornando resposta simulada.");
        return res.json({ success: true, analysis: DEMO_FALLBACK_RESPONSE });
      }
      return res.status(429).json({
        success: false,
        error: "Limite de uso da API atingido. Aguarde alguns minutos e tente novamente."
      });
    }

    if (status === 400) {
      console.error("[LeafScan] Anthropic: requisição inválida —", error.message);
      return res.status(400).json({
        success: false,
        error: "Requisição inválida. Verifique o formato da imagem e tente novamente."
      });
    }

    if (status >= 500) {
      console.error("[LeafScan] Anthropic: erro temporário do serviço —", status);
      if (DEMO_FALLBACK_ENABLED) {
        console.log("[LeafScan] Modo demonstração ativo: retornando resposta simulada.");
        return res.json({ success: true, analysis: DEMO_FALLBACK_RESPONSE });
      }
    }

    console.error("[LeafScan] Erro ao chamar Anthropic Claude:", error.message);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor. Verifique o console para mais detalhes."
    });
  }
});

app.listen(PORT, () => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  console.log(`LeafScan AI rodando em http://localhost:${PORT}`);
  console.log(`Provedor: Anthropic Claude | Modelo: ${ANTHROPIC_MODEL}`);
  console.log(`ANTHROPIC_API_KEY: ${apiKey ? `configurada (${apiKey.length} caracteres)` : "NÃO DEFINIDA"}`);
  if (!apiKey) {
    console.warn("[LeafScan] AVISO: ANTHROPIC_API_KEY não definida. Crie um arquivo .env antes de analisar imagens.");
  }
  if (DEMO_FALLBACK_ENABLED) {
    console.log("[LeafScan] Modo demonstração ativo: respostas simuladas em caso de erro de quota.");
  }
});
