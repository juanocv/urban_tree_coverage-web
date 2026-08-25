/**
 * Wiring: form state, validation, requests, exports, and the small amount of
 * chrome (theme, language, connection probe) around them.
 *
 * The view plan is mirrored client-side purely so the compass preview can show
 * which headings a run will capture before it costs anything. The API remains
 * the authority: whatever it plans is what the result reports.
 */

import { t, applyTranslations, toggleLang, onLangChange } from "./i18n.js";
import * as api from "./api.js";
import { headingDial } from "./charts.js";
import { renderSingle, renderMulti, renderBusy, renderError, renderEmpty } from "./render.js";
import { DEMO_SINGLE, DEMO_MULTI } from "./demo.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const form = $("#analysis-form");
const results = $("#results");
const statusPill = $("#status-pill");
const baseUrlInput = $("#base-url");
const tokenInput = $("#api-token");
const unlockButton = $("#unlock-base-url");
const connectionDialog = $("#connection-dialog");

/** The last thing rendered, kept so a language switch can re-render it. */
let lastRender = null;
let inFlight = null;

/* ------------------------------------------------------------- storage -- */

/**
 * The address baked in by `scripts/sync-config.py`, or the built-in fallback.
 * A static page cannot read .env, so this file stands in for it.
 */
const CONFIG_BASE_URL =
  api.normaliseBaseUrl(window.UC_CONFIG?.apiBaseUrl ?? "") || api.DEFAULT_BASE_URL;

const store = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
  },
};

/* --------------------------------------------------------------- theme -- */

function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

$("#theme-toggle").addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  store.set("utc.theme", next);
});

/* ------------------------------------------------------------ language -- */

$("#lang-toggle").addEventListener("click", () => toggleLang());

onLangChange(() => {
  lockBaseUrl(baseUrlInput.readOnly);
  syncNumericReadouts();
  updatePlanPreview();
  refreshConnectionCopy();
  if (lastRender) replay(lastRender);
  else renderEmpty(results);
});

/* ---------------------------------------------------------- view plan -- */

const wrap = (degrees) => ((Math.round(degrees) % 360) + 360) % 360;

/** Mirrors `urban_canopy.core.viewplan.plan_headings` for the preview. */
function planHeadings({ planMode, referenceHeading, offsets, nViews }) {
  let raw;
  if (planMode === "equiangular") {
    const step = 360 / Math.max(1, nViews);
    raw = Array.from({ length: Math.max(1, nViews) }, (_, i) => referenceHeading + i * step);
  } else {
    if (!offsets.length) return [];
    raw = offsets.map((offset) => referenceHeading + offset);
  }
  return [...new Set(raw.map(wrap))];
}

function parseOffsets(text) {
  return String(text)
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isFinite(value) && Number.isInteger(value));
}

/* ----------------------------------------------------------- form I/O -- */

function readForm() {
  const data = new FormData(form);
  const num = (name, fallback = 0) => {
    const value = Number(data.get(name));
    return Number.isFinite(value) ? value : fallback;
  };
  const text = (name) => String(data.get(name) ?? "").trim();

  return {
    // Read straight off the elements: these two live in the connection dialog,
    // outside <form>, so FormData never sees them.
    baseUrl: api.normaliseBaseUrl(baseUrlInput.value),
    apiToken: tokenInput.value.trim(),
    locationMode: data.get("locationMode") ?? "address",
    viewMode: data.get("viewMode") ?? "single",
    address: text("address"),
    lat: text("lat") === "" ? null : num("lat", NaN),
    lon: text("lon") === "" ? null : num("lon", NaN),
    heading: num("heading", 0),
    referenceHeading: num("referenceHeading", 0),
    pitch: num("pitch", 0),
    fov: num("fov", 90),
    size: text("size") || "640x640",
    planMode: data.get("planMode") ?? "offsets",
    offsets: parseOffsets(data.get("offsets") ?? ""),
    nViews: num("nViews", 4),
    minSuccessfulViews: num("minSuccessfulViews", 1),
    refine: data.get("refine") === "on",
    allowVegetationProxy: data.get("allowVegetationProxy") === "on",
    returnOverlays: data.get("returnOverlays") === "on",
  };
}

/** Client-side mirror of the API's own guards, so obvious mistakes cost nothing. */
function validate(values) {
  if (!values.baseUrl) return t("valid.baseUrl");

  if (values.locationMode === "address") {
    if (!values.address) return t("valid.address");
  } else {
    if (values.lat == null || values.lon == null || Number.isNaN(values.lat) || Number.isNaN(values.lon)) {
      return t("valid.coords");
    }
    if (values.lat < -90 || values.lat > 90 || values.lon < -180 || values.lon > 180) {
      return t("valid.coords");
    }
  }

  if (!/^[1-9]\d*x[1-9]\d*$/.test(values.size)) return t("valid.size");
  const [width, height] = values.size.split("x").map(Number);
  if (width > 4096 || height > 4096) return t("valid.size");

  if (values.viewMode === "multi" && values.planMode === "offsets" && !values.offsets.length) {
    return t("valid.offsets");
  }
  return null;
}

/** Build the request body the API expects, omitting what it should not receive. */
function buildRequest(values) {
  const location =
    values.locationMode === "coords"
      ? { lat: values.lat, lon: values.lon }
      : { address: values.address };

  if (values.viewMode === "single") {
    return {
      path: "/analyse/single",
      body: {
        ...location,
        heading: values.heading,
        pitch: values.pitch,
        fov: values.fov,
        size: values.size,
        refine: values.refine,
        allow_vegetation_proxy: values.allowVegetationProxy,
        return_overlays: values.returnOverlays,
      },
    };
  }

  const body = {
    ...location,
    reference_heading: values.referenceHeading,
    mode: values.planMode,
    pitch: values.pitch,
    fov: values.fov,
    size: values.size,
    min_successful_views: values.minSuccessfulViews,
    refine: values.refine,
    allow_vegetation_proxy: values.allowVegetationProxy,
    return_overlays: values.returnOverlays,
  };
  // The API validates both fields regardless of mode; send only the live one's
  // value and leave the other at its server-side default.
  if (values.planMode === "offsets") body.offsets = values.offsets;
  else body.n_views = values.nViews;

  return { path: "/analyse/multi", body };
}

/**
 * The API's own ceiling on overlay-bearing views. The server is authoritative —
 * its limit is configurable and it answers 422 — so this only warns, never
 * blocks, and an instance raised above the default still works.
 */
const DEFAULT_MAX_OVERLAY_VIEWS = 8;

/* ------------------------------------------------- conditional display -- */

function updateConditionalFields() {
  const values = {
    location: form.locationMode.value,
    view: form.viewMode.value,
    plan: $("#planMode").value,
  };
  $$("[data-when]").forEach((node) => {
    const [group, expected] = node.dataset.when.split(":");
    node.hidden = values[group] !== expected;
  });
}

function syncNumericReadouts() {
  $$("[data-sync]").forEach((box) => {
    const range = $(`#${box.dataset.sync}`);
    if (range) box.value = range.value;
  });
}

function updatePlanPreview() {
  const values = readForm();
  const headings = planHeadings(values);

  $("#plan-dial").innerHTML = headingDial(headings, values.referenceHeading);
  $("#plan-headings").textContent = headings.length
    ? headings.map((h) => `${h}°`).join(" · ")
    : t("plan.previewEmpty");

  // A run whose minimum exceeds the plan is a guaranteed 422; cap it here.
  const minViews = $("#minSuccessfulViews");
  const cap = Math.max(1, headings.length || 1);
  minViews.max = String(cap);
  if (Number(minViews.value) > cap) minViews.value = String(cap);
  syncNumericReadouts();
  updateOverlayWarning(values, headings.length);
}

/** Flag the payload cost before a large multi-view run pays for it. */
function updateOverlayWarning(values, plannedCount) {
  const node = $("#overlay-warning");
  const risky =
    values.viewMode === "multi" &&
    values.returnOverlays &&
    plannedCount > DEFAULT_MAX_OVERLAY_VIEWS;
  node.hidden = !risky;
  node.textContent = risky ? t("model.overlaysCost", { max: DEFAULT_MAX_OVERLAY_VIEWS }) : "";
}

/* ------------------------------------------------------- connection UI -- */

function setStatus(state) {
  statusPill.dataset.state = state;
  $(".pill__text", statusPill).textContent = t(`status.${state}`);
}

function refreshConnectionCopy() {
  const baseUrl = api.normaliseBaseUrl(baseUrlInput.value) || api.DEFAULT_BASE_URL;
  $("#docs-link").href = `${baseUrl}/docs`;
  $("#cors-snippet").textContent = `UC_API_CORS_ORIGINS=${location.origin}`;
  setStatus(statusPill.dataset.state || "offline");
}

function showConnFeedback(message, tone) {
  const node = $("#conn-feedback");
  node.hidden = !message;
  if (!message) { node.textContent = ""; node.className = "feedback"; return; }
  node.textContent = message ?? "";
  node.className = `feedback${tone ? ` feedback--${tone}` : ""}`;
}

async function testConnection({ quiet = false } = {}) {
  const baseUrl = api.normaliseBaseUrl(baseUrlInput.value);
  const token = tokenInput.value.trim();
  const button = $("#test-connection");
  button.classList.toggle("is-busy", !quiet);
  button.disabled = !quiet;
  if (!baseUrl) {
    setStatus("offline");
    return;
  }
  setStatus("checking");
  if (!quiet) showConnFeedback(t("conn.testing"), null);

  try {
    const { state, backend } = await api.probe(baseUrl, { token });
    setStatus(state);
    if (state === "online" && backend) {
      // Remember a working pair here too: the analysis form is not what was
      // just proved to work.
      store.set("utc.token", token);
      if (baseUrl && baseUrl !== CONFIG_BASE_URL) {
        store.set("utc.baseUrl", baseUrl);
        store.set("utc.baseUrl.configuredAgainst", CONFIG_BASE_URL);
      } else {
        store.remove("utc.baseUrl");
        store.remove("utc.baseUrl.configuredAgainst");
      }
      showConnFeedback(
        `${backend.backend} · ${backend.class_space ?? "?"} · ${backend.device ?? "?"}`,
        "ok"
      );
    } else if (state === "degraded") {
      showConnFeedback(t("status.degraded"), "warn");
    }
  } catch (error) {
    setStatus(error.kind === "unauthorized" ? "unauthorized" : "error");
    showConnFeedback(error.message, error.kind === "unauthorized" ? "warn" : "error");
  } finally {
    button.classList.remove("is-busy");
    button.disabled = false;
  }
}

/* ------------------------------------------------------------ requests -- */

function replay({ kind, payload, context }) {
  if (kind === "single") renderSingle(results, payload, context);
  else renderMulti(results, payload, context);
  wireExports(payload, context);
}

function show(kind, payload, context) {
  lastRender = { kind, payload, context };
  replay(lastRender);
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setBusy(busy) {
  const submit = $("#submit");
  submit.classList.toggle("is-busy", busy);
  // Deliberately not disabled: a run has no timeout, so pressing the button
  // again is how a request gets cancelled.
  submit.classList.toggle("btn--cancel", busy);
  $(".btn__label", submit).textContent = t(busy ? "actions.cancel" : "actions.analyse");
  submit.title = busy ? t("actions.analysing") : "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (inFlight) {
    inFlight.abort();
    inFlight = null;
    return;
  }

  const values = readForm();
  const problem = validate(values);
  const errorNode = $("#location-error");
  errorNode.hidden = !problem;
  errorNode.textContent = problem ?? "";
  if (problem) return;

  if (values.baseUrl && values.baseUrl !== CONFIG_BASE_URL) {
    store.set("utc.baseUrl", values.baseUrl);
    store.set("utc.baseUrl.configuredAgainst", CONFIG_BASE_URL);
  } else {
    store.remove("utc.baseUrl");
    store.remove("utc.baseUrl.configuredAgainst");
  }
  // Kept out of the URL on purpose: a shareable link must never carry a secret.
  store.set("utc.token", values.apiToken);
  writeUrlState(values);

  const { path, body } = buildRequest(values);
  const context = {
    request: { path, body },
    baseUrl: values.baseUrl,
    authenticated: Boolean(values.apiToken),
    isDemo: false,
  };

  inFlight = new AbortController();
  setBusy(true);
  renderBusy(results);

  try {
    const call = values.viewMode === "single" ? api.analyseSingle : api.analyseMulti;
    const payload = await call(values.baseUrl, body, {
      token: values.apiToken,
      signal: inFlight.signal,
    });
    setStatus("online");
    show(values.viewMode, payload, context);
  } catch (error) {
    lastRender = null;
    renderError(results, error);
    if (error.kind === "unauthorized") setStatus("unauthorized");
    else if (error.kind === "network" || error.kind === "mixed-content") setStatus("error");
  } finally {
    inFlight = null;
    setBusy(false);
  }
});

form.addEventListener("reset", () => {
  // Let the browser restore defaults first, then resync everything derived.
  setTimeout(() => {
    updateConditionalFields();
    updatePlanPreview();
    lastRender = null;
    renderEmpty(results);
    history.replaceState(null, "", location.pathname);
  }, 0);
});

$("#load-demo").addEventListener("click", () => {
  const mode = form.viewMode.value;
  const payload = mode === "single" ? DEMO_SINGLE : DEMO_MULTI;
  show(mode, payload, { isDemo: true });
});

/* ------------------------------------------------------------- exports -- */

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Same column order as the CLI's `views.csv`, so exports interchange. */
function toCsv(payload, kind) {
  const columns = [
    "image_path", "source", "lat", "lon", "heading", "pitch", "fov", "fov_size",
    "pano_id", "capture_date", "backend", "class_space", "tree_source",
    "tree_coverage_ratio", "tree_coverage_pct", "vegetation_coverage_ratio",
    "vegetation_coverage_pct", "valid_pixels", "total_pixels",
    "refinement_enabled", "quality_flags",
  ];
  const views = kind === "single" ? [payload] : payload.views ?? [];

  const rows = views.map((view) => {
    const capture = view.capture ?? {};
    const coverage = view.coverage ?? {};
    return [
      capture.image_path ?? "", capture.source ?? "", capture.lat ?? "", capture.lon ?? "",
      capture.heading ?? "", capture.pitch ?? "", capture.fov ?? "", capture.size ?? "",
      capture.pano_id ?? "", capture.capture_date ?? "", view.backend ?? "",
      view.class_space ?? "", coverage.tree_source ?? "",
      coverage.tree_coverage_ratio ?? "", coverage.tree_coverage_pct ?? "",
      coverage.vegetation_coverage_ratio ?? "", coverage.vegetation_coverage_pct ?? "",
      coverage.valid_pixels ?? "", coverage.total_pixels ?? "",
      view.refinement?.enabled ?? "", (view.quality_flags ?? []).join("|"),
    ];
  });

  const escape = (cell) => {
    const text = String(cell);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns.join(","), ...rows.map((row) => row.map(escape).join(","))].join("\r\n");
}

async function copy(button, text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return; // Clipboard blocked (insecure context or denied permission).
  }
  const original = button.textContent;
  button.textContent = t("res.export.copied");
  setTimeout(() => { button.textContent = original; }, 1600);
}

function wireExports(payload, context) {
  const kind = lastRender?.kind ?? "single";
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "");

  $$("[data-export]", results).forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      switch (button.dataset.export) {
        case "json":
          download(`urban-canopy-${kind}-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json");
          break;
        case "csv":
          download(`urban-canopy-${kind}-${stamp}.csv`, toCsv(payload, kind), "text/csv");
          break;
        case "copy":
          await copy(button, JSON.stringify(payload, null, 2));
          break;
        case "curl":
          await copy(
            button,
            api.toCurl(context.baseUrl, context.request.path, context.request.body, {
              authenticated: context.authenticated,
            })
          );
          break;
        case "link":
          await copy(button, location.href);
          break;
      }
    });
  });
}

/* ------------------------------------------------------------ URL state -- */

const URL_FIELDS = [
  "viewMode", "locationMode", "address", "lat", "lon", "heading", "referenceHeading",
  "pitch", "fov", "size", "planMode", "offsets", "nViews", "minSuccessfulViews",
];

/** Keep the address bar in step with the query, so a result is linkable. */
function writeUrlState(values) {
  const params = new URLSearchParams();
  params.set("mode", values.viewMode);

  if (values.locationMode === "coords") {
    params.set("lat", String(values.lat));
    params.set("lon", String(values.lon));
  } else {
    params.set("address", values.address);
  }

  if (values.viewMode === "single") {
    params.set("heading", String(values.heading));
  } else {
    params.set("reference_heading", String(values.referenceHeading));
    params.set("plan", values.planMode);
    if (values.planMode === "offsets") params.set("offsets", values.offsets.join(","));
    else params.set("n_views", String(values.nViews));
    params.set("min_views", String(values.minSuccessfulViews));
  }

  params.set("pitch", String(values.pitch));
  params.set("fov", String(values.fov));
  params.set("size", values.size);
  if (!values.refine) params.set("refine", "0");
  if (values.allowVegetationProxy) params.set("proxy", "1");
  if (!values.returnOverlays) params.set("overlays", "0");

  history.replaceState(null, "", `${location.pathname}?${params}`);
}

function readUrlState() {
  const params = new URLSearchParams(location.search);
  if (![...params.keys()].length) return;

  const setValue = (selector, value) => {
    if (value == null) return;
    const node = $(selector);
    if (node) node.value = value;
  };
  const setRadio = (name, value) => {
    const node = form.querySelector(`[name="${name}"][value="${value}"]`);
    if (node) node.checked = true;
  };
  const setCheck = (name, on) => {
    const node = form.querySelector(`[name="${name}"]`);
    if (node) node.checked = on;
  };

  if (params.get("mode")) setRadio("viewMode", params.get("mode"));

  if (params.get("lat") && params.get("lon")) {
    setRadio("locationMode", "coords");
    setValue("#lat", params.get("lat"));
    setValue("#lon", params.get("lon"));
  } else if (params.get("address")) {
    setRadio("locationMode", "address");
    setValue("#address", params.get("address"));
  }

  setValue("#heading", params.get("heading"));
  setValue("#referenceHeading", params.get("reference_heading"));
  setValue("#pitch", params.get("pitch"));
  setValue("#fov", params.get("fov"));
  setValue("#size", params.get("size"));
  setValue("#planMode", params.get("plan"));
  setValue("#offsets", params.get("offsets"));
  setValue("#nViews", params.get("n_views"));
  setValue("#minSuccessfulViews", params.get("min_views"));
  if (params.get("refine") === "0") setCheck("refine", false);
  if (params.get("proxy") === "1") setCheck("allowVegetationProxy", true);
  if (params.get("overlays") === "0") setCheck("returnOverlays", false);
  if (params.get("api")) setValue("#base-url", params.get("api"));
}

/* --------------------------------------------------------------- events -- */

form.addEventListener("input", (event) => {
  const target = event.target;

  // Number box drives its slider, and vice versa.
  if (target.dataset?.sync) {
    const range = $(`#${target.dataset.sync}`);
    if (range && target.value !== "") {
      const clamped = Math.min(Number(range.max), Math.max(Number(range.min), Number(target.value)));
      range.value = String(clamped);
    }
  }
  if (target.type === "range") syncNumericReadouts();

  if (target.name === "viewMode" || target.name === "locationMode" || target.id === "planMode") {
    updateConditionalFields();
  }
  if (
    ["referenceHeading", "offsets", "nViews", "planMode"].includes(target.id) ||
    target.name === "viewMode" ||
    target.name === "returnOverlays"
  ) {
    updatePlanPreview();
  }
});

connectionDialog.addEventListener("input", (event) => {
  if (event.target.id === "base-url") refreshConnectionCopy();
});

// A number box left out of range on blur snaps back to what the slider holds.
form.addEventListener("change", (event) => {
  if (event.target.dataset?.sync) syncNumericReadouts();
});

$("#toggle-token").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const revealed = tokenInput.type === "text";
  tokenInput.type = revealed ? "password" : "text";
  button.setAttribute("aria-pressed", String(!revealed));
});

/**
 * Lock or unlock the address field.
 *
 * It starts locked because the published default is normally the right one;
 * "Change" is the deliberate act of overriding it for this browser. Re-locking
 * whenever the dialog closes means reopening always shows the same safe state.
 */
function lockBaseUrl(locked) {
  baseUrlInput.readOnly = locked;
  unlockButton.setAttribute("aria-pressed", String(!locked));
  baseUrlInput.classList.toggle("is-locked", locked);
  // Owned entirely here, not by applyTranslations(): the text depends on the
  // lock state, which a data-i18n pass would happily overwrite.
  $("#base-url-hint").textContent = t(locked ? "conn.changeLocked" : "conn.changeUnlocked");
}

unlockButton.addEventListener("click", () => {
  const wasLocked = baseUrlInput.readOnly;
  lockBaseUrl(!wasLocked);
  if (wasLocked) {
    baseUrlInput.focus();
    baseUrlInput.select();
  }
});

connectionDialog.addEventListener("close", () => lockBaseUrl(true));

statusPill.addEventListener("click", () => {
  showConnFeedback(null);
  connectionDialog.showModal();
});

$("#test-connection").addEventListener("click", () => testConnection());

$("#open-help").addEventListener("click", () => $("#help-dialog").showModal());

$("#geolocate").addEventListener("click", () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      $("#lat").value = coords.latitude.toFixed(6);
      $("#lon").value = coords.longitude.toFixed(6);
    },
    (error) => showConnFeedback(error.message, "warn"),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

/* ----------------------------------------------------------------- boot -- */

function boot() {
  // An override is remembered only while the published default it replaced is
  // still the published default. Redeploying config.js with a new address
  // therefore wins, instead of being shadowed forever by a stale localStorage
  // entry the user cannot see.
  const storedBase = store.get("utc.baseUrl");
  const storedAgainst = store.get("utc.baseUrl.configuredAgainst");
  if (storedBase && storedAgainst === CONFIG_BASE_URL) {
    baseUrlInput.value = storedBase;
  } else {
    baseUrlInput.value = CONFIG_BASE_URL;
    store.remove("utc.baseUrl");
    store.remove("utc.baseUrl.configuredAgainst");
  }

  const storedToken = store.get("utc.token");
  if (storedToken) tokenInput.value = storedToken;
  lockBaseUrl(true);

  readUrlState();
  applyTranslations();
  updateConditionalFields();
  updatePlanPreview();
  refreshConnectionCopy();
  renderEmpty(results);

  // A quiet probe on load: an unreachable API is normal on a published page.
  testConnection({ quiet: true });
}

boot();
