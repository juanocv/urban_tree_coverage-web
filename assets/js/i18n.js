/**
 * Bilingual copy for the Urban Tree Coverage console.
 *
 * Static markup is translated through `data-i18n` (textContent),
 * `data-i18n-placeholder`, `data-i18n-title` and `data-i18n-aria`.
 * Anything built at runtime goes through `t(key, vars)`.
 */

const DICT = {
  pt: {
    "html.lang": "pt-BR",
    "doc.title": "Urban Tree Coverage — console de análise",
    "a11y.skip": "Ir para os resultados",

    "app.name": "Urban Tree Coverage",
    "app.tagline": "Cobertura arbórea visível de ruas, a partir de imagens do Street View",
    "app.langToggle": "English",
    "app.langToggleAria": "Switch to English",
    "app.themeAria": "Alternar tema claro/escuro",

    "status.offline": "Sem conexão",
    "status.checking": "Verificando…",
    "status.online": "API pronta",
    "status.degraded": "API responde, modelo não pronto",
    "status.error": "Falha na conexão",

    "conn.legend": "Conexão com a API",
    "conn.baseUrl": "Endereço da API",
    "conn.baseUrlHint": "Aponte para a instância do <code>urban_canopy.webapi</code> que você está executando.",
    "conn.test": "Testar conexão",
    "conn.testing": "Testando…",
    "conn.help": "Como executar a API",

    "loc.legend": "Local",
    "loc.required": "obrigatório",
    "loc.optional": "opcional",
    "loc.modeAddress": "Endereço",
    "loc.modeCoords": "Coordenadas",
    "loc.address": "Endereço",
    "loc.addressPlaceholder": "Av. Paulista 1578, São Paulo",
    "loc.addressHint": "Geocodificado pela API. Ignorado quando latitude e longitude são informadas.",
    "loc.lat": "Latitude",
    "loc.lon": "Longitude",
    "loc.coordsHint": "Graus decimais. Latitude entre −90 e 90, longitude entre −180 e 180.",
    "loc.useMyLocation": "Usar minha localização",

    "mode.legend": "Estratégia de vistas",
    "mode.single": "Vista única",
    "mode.singleDesc": "Um enquadramento, uma medida.",
    "mode.multi": "Multivista",
    "mode.multiDesc": "Várias direções e uma estatística agregada.",

    "capture.legend": "Captura",
    "capture.heading": "Direção (heading)",
    "capture.headingHint": "0° = norte, 90° = leste.",
    "capture.referenceHeading": "Direção de referência",
    "capture.referenceHeadingHint": "Tipicamente a orientação da rua. As demais vistas derivam dela.",
    "capture.pitch": "Inclinação (pitch)",
    "capture.pitchHint": "Negativo aponta para baixo, positivo para cima.",
    "capture.fov": "Campo de visão (fov)",
    "capture.fovHint": "Ângulos menores aproximam a cena.",
    "capture.size": "Tamanho da imagem",
    "capture.sizeHint": "LARGURAxALTURA, máximo 4096 px por lado.",

    "plan.legend": "Plano de vistas",
    "plan.mode": "Distribuição",
    "plan.modeOffsets": "Deslocamentos",
    "plan.modeEquiangular": "Equiangular",
    "plan.offsets": "Deslocamentos (graus)",
    "plan.offsetsHint": "Somados à direção de referência. Separe por vírgula.",
    "plan.nViews": "Número de vistas",
    "plan.nViewsHint": "Distribuídas uniformemente em 360°.",
    "plan.minViews": "Mínimo de vistas bem-sucedidas",
    "plan.minViewsHint": "A execução falha se menos vistas produzirem um resultado utilizável.",
    "plan.preview": "Direções planejadas",
    "plan.previewEmpty": "Nenhuma direção válida",

    "model.legend": "Modelo e máscara",
    "model.refine": "Refinar a máscara",
    "model.refineHint": "Limpeza conservadora, com trava de crescimento. Desligue para ver a máscara bruta.",
    "model.proxy": "Permitir vegetação como proxy de árvore",
    "model.proxyHint": "Só para backends cujo espaço de classes não distingue árvores. O resultado é marcado como proxy.",
    "model.overlays": "Retornar imagens sobrepostas",
    "model.overlaysHint": "RGB, máscara e sobreposição em PNG. Disponível apenas na vista única.",

    "actions.analyse": "Analisar",
    "actions.analysing": "Analisando…",
    "actions.cancel": "Cancelar",
    "actions.reset": "Limpar",
    "actions.demo": "Ver exemplo",
    "actions.demoHint": "Resultado de uma execução real, sem chamar a API.",

    "empty.title": "Nenhuma análise ainda",
    "empty.body": "Informe um endereço ou um par de coordenadas e execute a análise. Sem uma API acessível, o botão <strong>Ver exemplo</strong> carrega o resultado de uma execução real.",

    "busy.title": "Analisando",
    "busy.body": "A API baixa a imagem, executa a segmentação e devolve as métricas. A primeira chamada após a inicialização costuma ser a mais lenta.",

    "valid.baseUrl": "Informe o endereço da API.",
    "valid.address": "Informe um endereço para geocodificar.",
    "valid.coords": "Informe uma latitude e uma longitude válidas.",
    "valid.size": "Use LARGURAxALTURA, com no máximo 4096 px por lado.",
    "valid.offsets": "Informe ao menos um deslocamento inteiro.",

    "err.title": "A análise falhou",
    "err.network": "Não foi possível falar com a API em {url}. Verifique se ela está em execução e se o endereço está correto.",
    "err.mixedContent": "Esta página está em HTTPS e a API em HTTP num host que não é local: o navegador bloqueia a chamada. Use a API em localhost ou publique-a com HTTPS.",
    "err.validation": "A API recusou os parâmetros.",
    "err.busy": "A fila de inferência da API expirou. Tente novamente em instantes.",
    "err.notReady": "O backend ainda não terminou de carregar o modelo.",
    "err.multiview": "Vistas utilizáveis insuficientes",
    "err.multiviewBody": "{ok} de {planned} direções produziram um resultado; o mínimo exigido era {min}.",
    "err.aborted": "Análise cancelada.",

    "res.headline": "Cobertura arbórea",
    "res.headlineMulti": "Cobertura arbórea (mediana)",
    "res.ofImage": "da imagem",
    "res.ofImageMulti": "entre as vistas válidas",
    "res.vegetation": "Cobertura de vegetação",
    "res.unavailable": "indisponível",
    "res.unavailableWhy": "O espaço de classes deste backend não expressa árvores. Nenhum número de árvore é reportado no lugar dele.",
    "res.treeSource": "Origem da medida",
    "res.source.tree_class": "classe de árvore",
    "res.source.vegetation_proxy": "proxy de vegetação",
    "res.source.unavailable": "indisponível",
    "res.sourceProxyWarn": "Medido a partir de uma classe de vegetação, não de uma classe de árvore. Não é a mesma grandeza.",

    "res.imagery": "Imagens",
    "res.tabs.overlay": "Sobreposição",
    "res.tabs.rgb": "Original",
    "res.tabs.mask": "Máscara",
    "res.tabs.compare": "Comparar",
    "res.compareHint": "Arraste para comparar o original com a máscara de árvores.",
    "res.noImages": "Esta resposta não traz imagens. Ative <strong>Retornar imagens sobrepostas</strong> na vista única.",

    "res.groups": "Frações por grupo de classes",
    "res.groupsHint": "Árvore, grama e arbusto nunca são somados silenciosamente: cada grupo é reportado separadamente.",
    "res.group.tree": "árvore",
    "res.group.grass": "grama",
    "res.group.plant_shrub": "arbusto / planta",
    "res.group.vegetation": "vegetação",

    "res.pixels.tree": "Pixels de árvore",
    "res.pixels.vegetation": "Pixels de vegetação",
    "res.pixels.valid": "Pixels válidos",
    "res.pixels.total": "Pixels totais",

    "res.refinement": "Refinamento",
    "res.refinement.off": "Refinamento desligado — a máscara exibida é a bruta.",
    "res.refinement.areaRaw": "Área bruta",
    "res.refinement.areaRefined": "Área refinada",
    "res.refinement.delta": "Variação",
    "res.refinement.components": "Componentes removidos",
    "res.refinement.holes": "Buracos preenchidos",
    "res.refinement.guard": "Trava de crescimento",
    "res.refinement.guardOn": "acionada — o refinamento foi descartado",
    "res.refinement.guardOff": "não acionada",

    "res.capture": "Captura",
    "res.capture.source": "Fonte",
    "res.capture.coords": "Coordenadas",
    "res.capture.address": "Endereço",
    "res.capture.heading": "Direção",
    "res.capture.pitch": "Inclinação",
    "res.capture.fov": "Campo de visão",
    "res.capture.size": "Tamanho",
    "res.capture.pano": "Panorama",
    "res.capture.date": "Data da captura",
    "res.capture.imagePath": "Arquivo",
    "res.capture.openMaps": "Abrir no Google Maps",

    "res.provenance": "Proveniência",
    "res.prov.backend": "Backend",
    "res.prov.checkpoint": "Checkpoint",
    "res.prov.model": "Modelo",
    "res.prov.classSpace": "Espaço de classes",
    "res.prov.device": "Dispositivo",
    "res.prov.sha": "SHA-256 do checkpoint",
    "res.prov.taxonomySource": "Taxonomia",
    "res.prov.taxonomyBuiltin": "embutida",
    "res.prov.treeGroup": "Grupo de árvore",
    "res.prov.vegGroups": "Grupos de vegetação",
    "res.prov.notes": "Notas do backend",

    "res.flags": "Sinalizadores de qualidade",
    "flag.empty_tree_mask": "Máscara de árvore vazia",
    "flag.empty_tree_mask.desc": "Nenhum pixel de árvore foi encontrado nesta vista.",
    "flag.tree_coverage_unavailable": "Cobertura arbórea indisponível",
    "flag.tree_coverage_unavailable.desc": "O backend não consegue expressar uma classe de árvore.",
    "flag.tree_from_vegetation_proxy": "Árvore vinda de proxy de vegetação",
    "flag.tree_from_vegetation_proxy.desc": "O número foi medido sobre vegetação, não sobre árvores.",
    "flag.refinement_disabled": "Refinamento desligado",
    "flag.refinement_disabled.desc": "A máscara reportada é a saída bruta do segmentador.",
    "flag.refinement_growth_guard_triggered": "Trava de crescimento acionada",
    "flag.refinement_growth_guard_triggered.desc": "O refinamento inflaria a máscara além do limite e foi descartado.",
    "flag.coverage_above_90pct": "Cobertura acima de 90%",
    "flag.coverage_above_90pct.desc": "Valor extremo; vale conferir o enquadramento.",

    "res.aggregate": "Agregado das vistas",
    "res.aggregate.hint": "Estatísticas sobre as frações de cobertura por vista. Nada é somado entre vistas: uma árvore vista de quatro direções continua sendo uma árvore.",
    "res.agg.mean": "Média",
    "res.agg.median": "Mediana",
    "res.agg.p25": "p25",
    "res.agg.p75": "p75",
    "res.agg.iqr": "IIQ",
    "res.agg.std": "Desvio-padrão",
    "res.agg.min": "Mínimo",
    "res.agg.max": "Máximo",
    "res.agg.views": "Vistas",
    "res.agg.viewsValue": "{valid} válidas de {planned} planejadas",
    "res.agg.tree": "Árvore",
    "res.agg.vegetation": "Vegetação",

    "res.compass": "Cobertura por direção",
    "res.compass.hint": "O raio é proporcional à cobertura arbórea da vista; o anel externo marca 100%.",
    "res.failures": "Direções que falharam",
    "res.failure.stage": "Etapa",
    "res.failure.fetch": "download",
    "res.failure.analysis": "análise",

    "res.export": "Exportar",
    "res.export.json": "Baixar JSON",
    "res.export.csv": "Baixar CSV",
    "res.export.copy": "Copiar JSON",
    "res.export.copied": "Copiado",
    "res.export.curl": "Copiar cURL",
    "res.export.link": "Copiar link da consulta",
    "res.raw": "Resposta bruta",

    "demo.badge": "Exemplo",
    "demo.note": "Resultado armazenado de uma execução real do pipeline. Nenhuma chamada à API foi feita.",

    "help.title": "Executando a API localmente",
    "help.close": "Fechar",
    "help.intro": "Este site é estático e não processa imagens: ele conversa com a API do <code>urban_canopy</code> executada por você. Instale e suba a API:",
    "help.cors": "Depois libere a origem deste site no CORS da API, pelo <code>.env</code>:",
    "help.https": "Um navegador em HTTPS só aceita chamadas HTTP para <code>localhost</code> ou <code>127.0.0.1</code>. Para uma API em outra máquina, sirva-a com HTTPS.",
    "help.key": "A API chama uma API paga do Google a cada requisição e não tem autenticação. Mantenha-a em localhost ou atrás de um proxy.",

    "footer.repo": "Repositório",
    "footer.docs": "Documentação da API",
    "footer.license": "Apache 2.0",
    "footer.note": "As medidas vêm da API; este site apenas as apresenta.",

    "value.none": "—",
  },

  en: {
    "html.lang": "en",
    "doc.title": "Urban Tree Coverage — analysis console",
    "a11y.skip": "Skip to results",

    "app.name": "Urban Tree Coverage",
    "app.tagline": "Visible street-level tree coverage from Street View imagery",
    "app.langToggle": "Português",
    "app.langToggleAria": "Mudar para português",
    "app.themeAria": "Toggle light/dark theme",

    "status.offline": "Not connected",
    "status.checking": "Checking…",
    "status.online": "API ready",
    "status.degraded": "API up, model not ready",
    "status.error": "Connection failed",

    "conn.legend": "API connection",
    "conn.baseUrl": "API address",
    "conn.baseUrlHint": "Point this at the <code>urban_canopy.webapi</code> instance you are running.",
    "conn.test": "Test connection",
    "conn.testing": "Testing…",
    "conn.help": "How to run the API",

    "loc.legend": "Location",
    "loc.required": "required",
    "loc.optional": "optional",
    "loc.modeAddress": "Address",
    "loc.modeCoords": "Coordinates",
    "loc.address": "Address",
    "loc.addressPlaceholder": "Av. Paulista 1578, Sao Paulo",
    "loc.addressHint": "Geocoded by the API. Ignored when latitude and longitude are given.",
    "loc.lat": "Latitude",
    "loc.lon": "Longitude",
    "loc.coordsHint": "Decimal degrees. Latitude −90 to 90, longitude −180 to 180.",
    "loc.useMyLocation": "Use my location",

    "mode.legend": "View strategy",
    "mode.single": "Single view",
    "mode.singleDesc": "One framing, one measurement.",
    "mode.multi": "Multi-view",
    "mode.multiDesc": "Several headings and an aggregate statistic.",

    "capture.legend": "Capture",
    "capture.heading": "Heading",
    "capture.headingHint": "0° = north, 90° = east.",
    "capture.referenceHeading": "Reference heading",
    "capture.referenceHeadingHint": "Typically the street bearing. Every other view derives from it.",
    "capture.pitch": "Pitch",
    "capture.pitchHint": "Negative looks down, positive looks up.",
    "capture.fov": "Field of view",
    "capture.fovHint": "Narrower angles zoom in.",
    "capture.size": "Image size",
    "capture.sizeHint": "WIDTHxHEIGHT, at most 4096 px per side.",

    "plan.legend": "View plan",
    "plan.mode": "Distribution",
    "plan.modeOffsets": "Offsets",
    "plan.modeEquiangular": "Equiangular",
    "plan.offsets": "Offsets (degrees)",
    "plan.offsetsHint": "Added to the reference heading. Comma-separated.",
    "plan.nViews": "Number of views",
    "plan.nViewsHint": "Evenly spaced around 360°.",
    "plan.minViews": "Minimum successful views",
    "plan.minViewsHint": "The run fails if fewer headings produce a usable result.",
    "plan.preview": "Planned headings",
    "plan.previewEmpty": "No valid heading",

    "model.legend": "Model and mask",
    "model.refine": "Refine the mask",
    "model.refineHint": "Conservative cleanup with a growth guard. Turn off for the raw mask.",
    "model.proxy": "Allow vegetation as a tree proxy",
    "model.proxyHint": "Only for backends whose class space cannot express trees. The result is flagged as a proxy.",
    "model.overlays": "Return overlay images",
    "model.overlaysHint": "RGB, mask and overlay as PNG. Single view only.",

    "actions.analyse": "Analyse",
    "actions.analysing": "Analysing…",
    "actions.cancel": "Cancel",
    "actions.reset": "Reset",
    "actions.demo": "Load example",
    "actions.demoHint": "A real stored run, with no API call.",

    "empty.title": "No analysis yet",
    "empty.body": "Enter an address or a coordinate pair and run the analysis. Without a reachable API, <strong>Load example</strong> shows the result of a real run.",

    "busy.title": "Analysing",
    "busy.body": "The API downloads the frame, runs segmentation and returns the metrics. The first call after startup is usually the slowest.",

    "valid.baseUrl": "Enter the API address.",
    "valid.address": "Enter an address to geocode.",
    "valid.coords": "Enter a valid latitude and longitude.",
    "valid.size": "Use WIDTHxHEIGHT, at most 4096 px per side.",
    "valid.offsets": "Enter at least one integer offset.",

    "err.title": "The analysis failed",
    "err.network": "Could not reach the API at {url}. Check that it is running and that the address is right.",
    "err.mixedContent": "This page is on HTTPS and the API is on HTTP at a non-local host, so the browser blocks the call. Use the API on localhost, or serve it over HTTPS.",
    "err.validation": "The API rejected the parameters.",
    "err.busy": "The API inference queue timed out. Try again shortly.",
    "err.notReady": "The backend has not finished loading the model.",
    "err.multiview": "Not enough usable views",
    "err.multiviewBody": "{ok} of {planned} headings produced a result; {min} were required.",
    "err.aborted": "Analysis cancelled.",

    "res.headline": "Tree coverage",
    "res.headlineMulti": "Tree coverage (median)",
    "res.ofImage": "of the image",
    "res.ofImageMulti": "across valid views",
    "res.vegetation": "Vegetation coverage",
    "res.unavailable": "unavailable",
    "res.unavailableWhy": "This backend's class space cannot express trees. No tree number is reported in its place.",
    "res.treeSource": "Measured from",
    "res.source.tree_class": "tree class",
    "res.source.vegetation_proxy": "vegetation proxy",
    "res.source.unavailable": "unavailable",
    "res.sourceProxyWarn": "Measured from a vegetation class, not a tree class. It is not the same quantity.",

    "res.imagery": "Imagery",
    "res.tabs.overlay": "Overlay",
    "res.tabs.rgb": "Original",
    "res.tabs.mask": "Mask",
    "res.tabs.compare": "Compare",
    "res.compareHint": "Drag to compare the original with the tree mask.",
    "res.noImages": "This response carries no imagery. Turn on <strong>Return overlay images</strong> in single view.",

    "res.groups": "Class-group fractions",
    "res.groupsHint": "Tree, grass and shrub are never merged silently: each group is reported on its own.",
    "res.group.tree": "tree",
    "res.group.grass": "grass",
    "res.group.plant_shrub": "shrub / plant",
    "res.group.vegetation": "vegetation",

    "res.pixels.tree": "Tree pixels",
    "res.pixels.vegetation": "Vegetation pixels",
    "res.pixels.valid": "Valid pixels",
    "res.pixels.total": "Total pixels",

    "res.refinement": "Refinement",
    "res.refinement.off": "Refinement is off — the mask shown is the raw one.",
    "res.refinement.areaRaw": "Raw area",
    "res.refinement.areaRefined": "Refined area",
    "res.refinement.delta": "Change",
    "res.refinement.components": "Components removed",
    "res.refinement.holes": "Holes filled",
    "res.refinement.guard": "Growth guard",
    "res.refinement.guardOn": "triggered — refinement was discarded",
    "res.refinement.guardOff": "not triggered",

    "res.capture": "Capture",
    "res.capture.source": "Source",
    "res.capture.coords": "Coordinates",
    "res.capture.address": "Address",
    "res.capture.heading": "Heading",
    "res.capture.pitch": "Pitch",
    "res.capture.fov": "Field of view",
    "res.capture.size": "Size",
    "res.capture.pano": "Panorama",
    "res.capture.date": "Capture date",
    "res.capture.imagePath": "File",
    "res.capture.openMaps": "Open in Google Maps",

    "res.provenance": "Provenance",
    "res.prov.backend": "Backend",
    "res.prov.checkpoint": "Checkpoint",
    "res.prov.model": "Model",
    "res.prov.classSpace": "Class space",
    "res.prov.device": "Device",
    "res.prov.sha": "Checkpoint SHA-256",
    "res.prov.taxonomySource": "Taxonomy",
    "res.prov.taxonomyBuiltin": "built-in",
    "res.prov.treeGroup": "Tree group",
    "res.prov.vegGroups": "Vegetation groups",
    "res.prov.notes": "Backend notes",

    "res.flags": "Quality flags",
    "flag.empty_tree_mask": "Empty tree mask",
    "flag.empty_tree_mask.desc": "No tree pixel was found in this view.",
    "flag.tree_coverage_unavailable": "Tree coverage unavailable",
    "flag.tree_coverage_unavailable.desc": "The backend cannot express a tree class.",
    "flag.tree_from_vegetation_proxy": "Tree from vegetation proxy",
    "flag.tree_from_vegetation_proxy.desc": "The number was measured over vegetation, not trees.",
    "flag.refinement_disabled": "Refinement disabled",
    "flag.refinement_disabled.desc": "The reported mask is the segmenter's raw output.",
    "flag.refinement_growth_guard_triggered": "Growth guard triggered",
    "flag.refinement_growth_guard_triggered.desc": "Refinement would have inflated the mask past the cap and was discarded.",
    "flag.coverage_above_90pct": "Coverage above 90%",
    "flag.coverage_above_90pct.desc": "An extreme value; worth checking the framing.",

    "res.aggregate": "View aggregate",
    "res.aggregate.hint": "Statistics over the per-view coverage fractions. Nothing is summed across views: a tree seen from four headings is still one tree.",
    "res.agg.mean": "Mean",
    "res.agg.median": "Median",
    "res.agg.p25": "p25",
    "res.agg.p75": "p75",
    "res.agg.iqr": "IQR",
    "res.agg.std": "Std. dev.",
    "res.agg.min": "Min",
    "res.agg.max": "Max",
    "res.agg.views": "Views",
    "res.agg.viewsValue": "{valid} valid of {planned} planned",
    "res.agg.tree": "Tree",
    "res.agg.vegetation": "Vegetation",

    "res.compass": "Coverage by heading",
    "res.compass.hint": "Radius is proportional to the view's tree coverage; the outer ring marks 100%.",
    "res.failures": "Failed headings",
    "res.failure.stage": "Stage",
    "res.failure.fetch": "fetch",
    "res.failure.analysis": "analysis",

    "res.export": "Export",
    "res.export.json": "Download JSON",
    "res.export.csv": "Download CSV",
    "res.export.copy": "Copy JSON",
    "res.export.copied": "Copied",
    "res.export.curl": "Copy cURL",
    "res.export.link": "Copy query link",
    "res.raw": "Raw response",

    "demo.badge": "Example",
    "demo.note": "A stored result from a real pipeline run. No API call was made.",

    "help.title": "Running the API locally",
    "help.close": "Close",
    "help.intro": "This site is static and processes nothing: it talks to the <code>urban_canopy</code> API you run. Install it and start the server:",
    "help.cors": "Then allow this site's origin in the API's CORS settings, via <code>.env</code>:",
    "help.https": "A browser on HTTPS only accepts HTTP calls to <code>localhost</code> or <code>127.0.0.1</code>. For an API on another machine, serve it over HTTPS.",
    "help.key": "The API calls a paid Google API on every request and has no authentication. Keep it on localhost or behind a proxy.",

    "footer.repo": "Repository",
    "footer.docs": "API docs",
    "footer.license": "Apache 2.0",
    "footer.note": "The measurements come from the API; this site only presents them.",

    "value.none": "—",
  },
};

const STORAGE_KEY = "utc.lang";
const listeners = new Set();

function initialLang() {
  const fromQuery = new URLSearchParams(location.search).get("lang");
  if (fromQuery && DICT[fromQuery]) return fromQuery;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICT[stored]) return stored;
  } catch { /* storage unavailable */ }
  return (navigator.language || "").toLowerCase().startsWith("pt") ? "pt" : "en";
}

let lang = initialLang();

export function currentLang() {
  return lang;
}

export function locale() {
  return lang === "pt" ? "pt-BR" : "en-US";
}

/** Translate `key`, interpolating `{name}` placeholders from `vars`. */
export function t(key, vars) {
  const raw = DICT[lang][key] ?? DICT.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

export function setLang(next) {
  if (!DICT[next] || next === lang) return;
  lang = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable */ }
  applyTranslations();
  listeners.forEach((fn) => fn(lang));
}

export function toggleLang() {
  setLang(lang === "pt" ? "en" : "pt");
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Rewrite every `data-i18n*` node in `root` for the active language. */
export function applyTranslations(root = document) {
  if (root === document) {
    document.documentElement.lang = t("html.lang");
    document.title = t("doc.title");
  }
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    // Keys whose copy carries inline markup opt in explicitly.
    if (node.hasAttribute("data-i18n-html")) node.innerHTML = t(key);
    else node.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
}
