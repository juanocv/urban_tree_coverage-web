/**
 * Renders API payloads into the results column.
 *
 * The API's response shape is the source of truth: nothing is recomputed here
 * beyond formatting, and a value the API reports as unavailable is shown as
 * unavailable rather than replaced by a substitute number.
 */

import { t, locale } from "./i18n.js";
import { ringGauge, groupBars, compassPlot, spreadBar } from "./charts.js";

/* ----------------------------------------------------------- formatting -- */

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

const nf = (options) => new Intl.NumberFormat(locale(), options);

/** Percentage with two decimals; `null` becomes an em dash. */
export function pct(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return t("value.none");
  return `${nf({ minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}%`;
}

/** A ratio in [0, 1] rendered as a percentage. */
export function ratioPct(value, digits = 2) {
  return value == null || !Number.isFinite(value) ? t("value.none") : pct(value * 100, digits);
}

export function int(value) {
  return value == null || !Number.isFinite(value) ? t("value.none") : nf().format(value);
}

export function deg(value) {
  return value == null ? t("value.none") : `${value}°`;
}

/* -------------------------------------------------------------- pieces -- */

/** Aspect ratio for the image frame, taken from the capture size when known. */
function frameRatio(size) {
  const match = /^(\d+)x(\d+)$/.exec(String(size ?? ""));
  return match ? `${match[1]} / ${match[2]}` : "3 / 2";
}

/** Accept both base64 payloads (live API) and plain URLs (stored example). */
function imageSources(overlays) {
  if (!overlays) return null;
  const pick = (b64Key, urlKey) => {
    if (overlays[urlKey]) return overlays[urlKey];
    if (overlays[b64Key]) return `data:image/png;base64,${overlays[b64Key]}`;
    return null;
  };
  const sources = {
    rgb: pick("rgb_png_b64", "rgb_url"),
    overlay: pick("overlay_tree_png_b64", "overlay_tree_url"),
    mask: pick("mask_refined_png_b64", "mask_refined_url"),
  };
  return sources.rgb || sources.overlay || sources.mask ? sources : null;
}

function chip(text, { tone = "", dot = false } = {}) {
  return `<span class="chip${tone ? ` chip--${tone}` : ""}">${
    dot ? '<i class="chip__dot" aria-hidden="true"></i>' : ""
  }${esc(text)}</span>`;
}

function datalist(rows) {
  const body = rows
    .filter(([, value]) => value != null && value !== "")
    .map(
      ([label, value, prose]) => `
    <div class="datalist__row${label ? "" : " datalist__row--wide"}">
      ${label ? `<dt>${esc(label)}</dt>` : ""}
      <dd${prose ? ' class="is-prose"' : ""}>${value}</dd>
    </div>`
    )
    .join("");
  return body ? `<dl class="datalist">${body}</dl>` : "";
}

function metric(label, value, { accent = false, unit = "" } = {}) {
  return `
  <div class="metric${accent ? " metric--accent" : ""}">
    <span class="metric__label">${esc(label)}</span>
    <span class="metric__value">${esc(value)}${unit ? `<small> ${esc(unit)}</small>` : ""}</span>
  </div>`;
}

function card(title, body, { extra = "", className = "" } = {}) {
  return `
  <section class="card${className ? ` ${className}` : ""}">
    <div class="card__head"><h2>${esc(title)}</h2>${extra}</div>
    <div class="card__body">${body}</div>
  </section>`;
}

/* --------------------------------------------------------------- states -- */

export function renderBusy(container) {
  container.setAttribute("aria-busy", "true");
  resetViewerDialog();
  container.innerHTML = `
  <div class="state state--busy">
    <svg viewBox="0 0 64 64" aria-hidden="true" class="state__art">
      <circle cx="32" cy="30" r="21" fill="none" class="state__ring" />
      <path class="state__canopy" d="M32 15c5.4 0 9.8 4.1 9.8 9.2 0 1.5-.4 2.9-1.1 4.2 1.9 1.2 3.1 3.2 3.1 5.4 0 3.6-3.1 6.6-6.9 6.6H27c-3.8 0-6.9-3-6.9-6.6 0-2.2 1.2-4.2 3.1-5.4a9 9 0 0 1-1.1-4.2c0-5.1 4.4-9.2 9.9-9.2Z" />
      <path class="state__trunk" d="M32 40.4V51" fill="none" stroke-linecap="round" />
    </svg>
    <h2>${esc(t("busy.title"))}</h2>
    <p>${esc(t("busy.body"))}</p>
  </div>`;
}

export function renderEmpty(container) {
  container.setAttribute("aria-busy", "false");
  resetViewerDialog();
  container.innerHTML = `
  <div class="state state--empty">
    <svg viewBox="0 0 64 64" aria-hidden="true" class="state__art">
      <circle cx="32" cy="30" r="21" fill="none" class="state__ring" />
      <path class="state__canopy" d="M32 15c5.4 0 9.8 4.1 9.8 9.2 0 1.5-.4 2.9-1.1 4.2 1.9 1.2 3.1 3.2 3.1 5.4 0 3.6-3.1 6.6-6.9 6.6H27c-3.8 0-6.9-3-6.9-6.6 0-2.2 1.2-4.2 3.1-5.4a9 9 0 0 1-1.1-4.2c0-5.1 4.4-9.2 9.9-9.2Z" />
      <path class="state__trunk" d="M32 40.4V51" fill="none" stroke-linecap="round" />
    </svg>
    <h2>${esc(t("empty.title"))}</h2>
    <p>${t("empty.body")}</p>
  </div>`;
}

export function renderError(container, error) {
  container.setAttribute("aria-busy", "false");
  resetViewerDialog();

  let body = `<p class="card__note">${esc(error.message)}</p>`;

  if (error.kind === "multiview" && error.detail) {
    const d = error.detail;
    body = `
    <p class="card__note">${esc(
      t("err.multiviewBody", {
        ok: (d.successful_headings ?? []).length,
        planned: (d.planned_headings ?? []).length,
        min: d.min_successful_views ?? "?",
      })
    )}</p>
    ${
      (d.failures ?? []).length
        ? `<div class="views-grid">${d.failures
            .map(
              (f) => `
      <div class="view-card view-card--failed">
        <div class="view-card__head">
          <span class="view-card__heading">${deg(f.heading)}</span>
          <span class="view-card__value is-unavailable">${esc(
            t(`res.failure.${f.stage}`) || f.stage
          )}</span>
        </div>
        <p class="view-card__meta">${esc(f.error_type)}: ${esc(f.message)}</p>
      </div>`
            )
            .join("")}</div>`
        : ""
    }`;
  } else if (error.detail && typeof error.detail !== "string") {
    body += `<pre class="error-detail">${esc(JSON.stringify(error.detail, null, 2))}</pre>`;
  }

  container.innerHTML = card(
    error.kind === "multiview" ? t("err.multiview") : t("err.title"),
    body,
    { className: "card--error" }
  );
}

/* --------------------------------------------------------- shared cards -- */

function flagsCard(flags) {
  if (!flags?.length) return "";
  const items = flags
    .map((flag) => {
      const informational = flag === "refinement_disabled";
      return `
    <div class="flag${informational ? " flag--info" : ""}">
      <svg class="flag__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.5v4.2M12 16.2h.01" stroke-linecap="round" />
        <circle cx="12" cy="12" r="8.5" />
      </svg>
      <span class="flag__name">${esc(t(`flag.${flag}`) === `flag.${flag}` ? flag : t(`flag.${flag}`))}</span>
      <span class="flag__desc">${esc(
        t(`flag.${flag}.desc`) === `flag.${flag}.desc` ? "" : t(`flag.${flag}.desc`)
      )}</span>
    </div>`;
    })
    .join("");
  return card(t("res.flags"), `<div class="flag-list">${items}</div>`);
}

function provenanceCard(provenance, { classSpace, notes } = {}) {
  if (!provenance) return "";
  const taxonomy = provenance.taxonomy ?? {};
  const source =
    provenance.taxonomy_source === "built-in"
      ? t("res.prov.taxonomyBuiltin")
      : provenance.taxonomy_source;

  const rows = datalist([
    [t("res.prov.backend"), esc(provenance.backend)],
    [t("res.prov.model"), esc(provenance.model_name ?? provenance.checkpoint)],
    [
      t("res.prov.checkpoint"),
      provenance.checkpoint && provenance.checkpoint !== provenance.model_name
        ? esc(provenance.checkpoint)
        : null,
    ],
    [t("res.prov.classSpace"), esc(provenance.class_space ?? classSpace)],
    [t("res.prov.device"), esc(provenance.device)],
    [t("res.prov.sha"), provenance.checkpoint_sha256 ? esc(provenance.checkpoint_sha256) : null],
    [t("res.prov.taxonomySource"), esc(source)],
    [t("res.prov.treeGroup"), taxonomy.tree_group ? esc(taxonomy.tree_group) : null],
    [
      t("res.prov.vegGroups"),
      taxonomy.vegetation_groups?.length ? esc(taxonomy.vegetation_groups.join(", ")) : null,
    ],
  ]);

  const noteList = notes?.length
    ? `<div>
        <p class="metric__label" style="margin-bottom:.5rem">${esc(t("res.prov.notes"))}</p>
        <ul class="notes-list">${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
       </div>`
    : "";

  return card(t("res.provenance"), rows + noteList);
}

function captureCard(capture) {
  if (!capture) return "";
  const hasCoords = capture.lat != null && capture.lon != null;
  const coords = hasCoords ? `${capture.lat.toFixed(6)}, ${capture.lon.toFixed(6)}` : null;
  const mapsLink = hasCoords
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${capture.lat},${capture.lon}"
          target="_blank" rel="noopener noreferrer">${esc(t("res.capture.openMaps"))}</a>`
    : null;

  return card(
    t("res.capture"),
    datalist([
      [t("res.capture.source"), esc(capture.source)],
      [t("res.capture.address"), capture.address ? esc(capture.address) : null, true],
      [t("res.capture.coords"), coords ? esc(coords) : null],
      [t("res.capture.heading"), capture.heading != null ? deg(capture.heading) : null],
      [t("res.capture.pitch"), capture.pitch != null ? deg(capture.pitch) : null],
      [t("res.capture.fov"), capture.fov != null ? deg(capture.fov) : null],
      [t("res.capture.size"), capture.size ? esc(capture.size) : null],
      [t("res.capture.pano"), capture.pano_id ? esc(capture.pano_id) : null],
      [t("res.capture.date"), capture.capture_date ? esc(capture.capture_date) : null],
      [t("res.capture.imagePath"), capture.image_path ? esc(capture.image_path) : null],
      ["", mapsLink, true],
    ])
  );
}

function refinementCard(refinement) {
  if (!refinement) return "";
  if (!refinement.enabled) {
    return card(t("res.refinement"), `<p class="card__note">${esc(t("res.refinement.off"))}</p>`);
  }

  const delta = refinement.area_refined - refinement.area_raw;
  const sign = delta > 0 ? "+" : "";
  const growth = refinement.area_growth_frac ?? 0;

  const body = `
  <div class="metrics">
    ${metric(t("res.refinement.areaRaw"), int(refinement.area_raw), { unit: "px" })}
    ${metric(t("res.refinement.areaRefined"), int(refinement.area_refined), { unit: "px" })}
    ${metric(t("res.refinement.delta"), `${sign}${int(delta)}`, {
      unit: `px (${sign}${pct(growth * 100)})`,
    })}
    ${metric(t("res.refinement.components"), int(refinement.components_removed))}
    ${metric(t("res.refinement.holes"), int(refinement.holes_filled))}
  </div>
  <div>
    <span class="metric__label">${esc(t("res.refinement.guard"))}</span>
    <p class="card__note">${esc(
      refinement.growth_guard_triggered
        ? t("res.refinement.guardOn")
        : t("res.refinement.guardOff")
    )}</p>
  </div>`;
  return card(t("res.refinement"), body);
}

function compositionCard(coverage) {
  const groups = coverage.group_ratios ?? {};
  const tones = {
    tree: "--c-tree",
    grass: "--c-grass",
    plant_shrub: "--c-shrub",
    vegetation: "--c-veg",
  };
  const rows = Object.entries(groups).map(([name, value]) => ({
    label: t(`res.group.${name}`) === `res.group.${name}` ? name : t(`res.group.${name}`),
    value: value ?? 0,
    display: ratioPct(value),
    tone: tones[name] ?? "--c-veg",
  }));

  const bars = rows.length
    ? `<div>
        ${groupBars(rows)}
        <p class="card__note" style="margin-top:.75rem">${esc(t("res.groupsHint"))}</p>
      </div>`
    : "";

  const pixels = `
  <div class="metrics">
    ${metric(t("res.pixels.tree"), int(coverage.tree_pixels), { accent: true })}
    ${metric(t("res.pixels.vegetation"), int(coverage.vegetation_pixels))}
    ${metric(t("res.pixels.valid"), int(coverage.valid_pixels))}
    ${metric(t("res.pixels.total"), int(coverage.total_pixels))}
  </div>`;

  return card(t("res.groups"), bars + pixels);
}

function exportCard(payload, context) {
  return `
  <section class="card">
    <div class="card__head"><h2>${esc(t("res.export"))}</h2></div>
    <div class="card__body">
      <div class="export-bar">
        <button class="btn btn--ghost" data-export="json">${esc(t("res.export.json"))}</button>
        <button class="btn btn--ghost" data-export="csv">${esc(t("res.export.csv"))}</button>
        <button class="btn btn--ghost" data-export="copy">${esc(t("res.export.copy"))}</button>
        ${
          context?.request
            ? `<button class="btn btn--ghost" data-export="curl">${esc(t("res.export.curl"))}</button>`
            : ""
        }
        <button class="btn btn--ghost" data-export="link">${esc(t("res.export.link"))}</button>
      </div>
    </div>
  </section>
  <details class="card raw">
    <summary>${esc(t("res.raw"))}</summary>
    <pre><code>${esc(JSON.stringify(payload, null, 2))}</code></pre>
  </details>`;
}

/** Tree-source chip plus, when the number came from a proxy, the warning. */
function sourceMeta(coverage, isDemo) {
  const source = coverage.tree_source ?? "unavailable";
  const label = t(`res.source.${source}`);
  const chips = [
    chip(`${t("res.treeSource")}: ${label === `res.source.${source}` ? source : label}`, {
      tone: source === "tree_class" ? "tree" : source === "vegetation_proxy" ? "warn" : "danger",
      dot: true,
    }),
  ];
  if (isDemo) chips.push(chip(t("demo.badge"), { tone: "demo" }));
  return chips.join("");
}

/* --------------------------------------------------------- single view -- */

export function renderSingle(container, payload, context = {}) {
  container.setAttribute("aria-busy", "false");
  resetViewerDialog();

  const coverage = payload.coverage ?? {};
  const capture = payload.capture ?? {};
  const available = coverage.tree_coverage_pct != null;
  const images = imageSources(payload.overlays);

  const headline = `
  <section class="card">
    <div class="headline">
      ${ringGauge({
        value: coverage.tree_coverage_pct ?? null,
        centerLabel: available ? pct(coverage.tree_coverage_pct, 1) : "—",
        ariaLabel: `${t("res.headline")}: ${pct(coverage.tree_coverage_pct)}`,
      })}
      <div class="headline__figures">
        <div>
          <span class="headline__label">${esc(t("res.headline"))}</span>
          <div class="headline__value${available ? "" : " is-unavailable"}">
            ${
              available
                ? `${nfDisplay(coverage.tree_coverage_pct)}<small>% ${esc(t("res.ofImage"))}</small>`
                : esc(t("res.unavailable"))
            }
          </div>
          ${
            available
              ? `<p class="headline__caption">${esc(t("res.vegetation"))}: ${ratioPct(
                  coverage.vegetation_coverage_ratio
                )}</p>`
              : `<p class="headline__caption">${esc(t("res.unavailableWhy"))}</p>`
          }
        </div>
        <div class="headline__meta">${sourceMeta(coverage, context.isDemo)}</div>
        ${
          coverage.tree_source === "vegetation_proxy"
            ? `<p class="card__note">${esc(t("res.sourceProxyWarn"))}</p>`
            : ""
        }
        ${context.isDemo ? `<p class="card__note">${esc(t("demo.note"))}</p>` : ""}
      </div>
    </div>
  </section>`;

  const imagery = images
    ? card(t("res.imagery"), viewerMarkup(images, capture.size))
    : card(t("res.imagery"), `<p class="card__note">${t("res.noImages")}</p>`);

  container.innerHTML = [
    headline,
    imagery,
    compositionCard(coverage),
    refinementCard(payload.refinement),
    captureCard(capture),
    provenanceCard(payload.backend_provenance, {
      classSpace: payload.class_space,
      notes: payload.backend_notes,
    }),
    flagsCard(payload.quality_flags),
    exportCard(payload, context),
  ]
    .filter(Boolean)
    .join("");

  wireViewer(container);
}

/** Tabbed viewer over one view's imagery: overlay, RGB, mask, and a comparer. */
function viewerMarkup(images, size) {
  return `
    <div class="viewer" data-viewer style="--frame-ratio:${frameRatio(size)}">
      <div class="tabs" role="tablist">
        ${images.overlay ? tabButton("overlay", t("res.tabs.overlay"), true) : ""}
        ${images.rgb ? tabButton("rgb", t("res.tabs.rgb")) : ""}
        ${images.mask ? tabButton("mask", t("res.tabs.mask")) : ""}
        ${images.rgb && images.overlay ? tabButton("compare", t("res.tabs.compare")) : ""}
      </div>
      <div class="frame" data-panel="overlay">
        <img src="${esc(images.overlay ?? images.rgb)}" alt="${esc(t("res.tabs.overlay"))}" />
      </div>
      <div class="frame" data-panel="rgb" hidden>
        <img src="${esc(images.rgb ?? "")}" alt="${esc(t("res.tabs.rgb"))}" />
      </div>
      <div class="frame frame--mask" data-panel="mask" hidden>
        <img src="${esc(images.mask ?? "")}" alt="${esc(t("res.tabs.mask"))}" />
      </div>
      ${
        images.rgb && images.overlay
          ? `
      <div class="frame compare" data-panel="compare" hidden style="--split:50%">
        <img src="${esc(images.rgb)}" alt="${esc(t("res.tabs.rgb"))}" />
        <div class="compare__clip"><img src="${esc(images.overlay)}" alt="${esc(t("res.tabs.overlay"))}" /></div>
        <div class="compare__handle" aria-hidden="true"></div>
        <input class="compare__range" type="range" min="0" max="100" value="50"
               aria-label="${esc(t("res.tabs.compare"))}" />
      </div>
      <p class="card__note" data-compare-hint hidden>${esc(t("res.compareHint"))}</p>`
          : ""
      }
    </div>`;
}

/**
 * Per-heading imagery for a multi-view run.
 *
 * One layer is shown across every tile at once, so what the eye compares
 * between headings is always like for like; a tile opens the full tabbed
 * viewer for its own heading.
 */
function galleryCard(entries) {
  if (!entries.length) {
    return card(
      t("res.imageryByHeading"),
      `<p class="card__note">${t("res.imageryNoneMulti")}</p>`
    );
  }

  const layers = [
    ["overlay", t("res.tabs.overlay")],
    ["rgb", t("res.tabs.rgb")],
    ["mask", t("res.tabs.mask")],
  ].filter(([key]) => entries.some((entry) => entry.images[key]));

  const tiles = entries
    .map(({ view, images }, index) => {
      const value = view.coverage?.tree_coverage_pct;
      const heading = deg(view.capture?.heading);
      return `
      <figure class="tile">
        <button class="tile__button" type="button" data-view-index="${index}"
                aria-label="${esc(t("res.openView", { heading }))}">
          <span class="frame" style="--frame-ratio:${frameRatio(view.capture?.size)}">
            ${layers
              .map(([key], position) =>
                images[key]
                  ? `<img data-layer="${key}" src="${esc(images[key])}" alt="" ${
                      position === 0 ? "" : "hidden"
                    } />`
                  : ""
              )
              .join("")}
          </span>
        </button>
        <figcaption class="tile__caption">
          <span class="tile__heading">${heading}</span>
          <span class="tile__value">${value == null ? esc(t("res.unavailable")) : pct(value)}</span>
        </figcaption>
      </figure>`;
    })
    .join("");

  return card(
    t("res.imageryByHeading"),
    `<div class="gallery" data-gallery>
      <div class="tabs" role="tablist">
        ${layers.map(([key, label], i) => tabButton(key, label, i === 0)).join("")}
      </div>
      <div class="tile-grid">${tiles}</div>
      <p class="card__note">${esc(t("res.imageryHint"))}</p>
    </div>`
  );
}

function tabButton(name, label, selected = false) {
  return `<button class="tab" type="button" role="tab" data-tab="${name}"
          aria-selected="${selected}">${esc(label)}</button>`;
}

/** Display helper: the integer/decimal split of the headline number. */
function nfDisplay(value) {
  return esc(
    new Intl.NumberFormat(locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
}

/* ---------------------------------------------------------- multi view -- */

export function renderMulti(container, payload, context = {}) {
  container.setAttribute("aria-busy", "false");
  resetViewerDialog();

  const aggregate = payload.aggregate ?? {};
  const treeStats = aggregate.tree_coverage ?? {};
  const treePct = aggregate.tree_coverage_pct ?? {};
  const vegStats = aggregate.vegetation_coverage ?? {};
  const views = payload.views ?? [];
  const failures = payload.failures ?? [];
  const available = treePct.median != null;

  const headline = `
  <section class="card">
    <div class="headline">
      ${ringGauge({
        value: treePct.median ?? null,
        centerLabel: available ? pct(treePct.median, 1) : "—",
        ariaLabel: `${t("res.headlineMulti")}: ${pct(treePct.median)}`,
      })}
      <div class="headline__figures">
        <div>
          <span class="headline__label">${esc(t("res.headlineMulti"))}</span>
          <div class="headline__value${available ? "" : " is-unavailable"}">
            ${
              available
                ? `${nfDisplay(treePct.median)}<small>% ${esc(t("res.ofImageMulti"))}</small>`
                : esc(t("res.unavailable"))
            }
          </div>
          <p class="headline__caption">${esc(
            t("res.agg.viewsValue", {
              valid: treeStats.n_valid_views ?? 0,
              planned: treeStats.n_views ?? views.length,
            })
          )}</p>
        </div>
        ${
          available
            ? `<div>${spreadBar({
                min: treePct.min,
                p25: treePct.p25,
                median: treePct.median,
                p75: treePct.p75,
                max: treePct.max,
                ariaLabel: `${t("res.agg.min")} ${pct(treePct.min)} – ${t("res.agg.max")} ${pct(treePct.max)}`,
              })}</div>`
            : ""
        }
        <div class="headline__meta">
          ${views.length ? sourceMeta(views[0].coverage ?? {}, context.isDemo) : ""}
          ${failures.length ? chip(`${failures.length} × ${t("res.failures")}`, { tone: "danger", dot: true }) : ""}
        </div>
        ${context.isDemo ? `<p class="card__note">${esc(t("demo.note"))}</p>` : ""}
      </div>
    </div>
  </section>`;

  // Views whose payload carried overlays; empty unless return_overlays was on.
  const galleryEntries = views
    .map((view) => ({ view, images: imageSources(view.overlays) }))
    .filter((entry) => entry.images);

  const points = [
    ...views.map((view) => ({
      heading: view.capture?.heading ?? null,
      value: view.coverage?.tree_coverage_pct ?? null,
      label: `${deg(view.capture?.heading)} — ${pct(view.coverage?.tree_coverage_pct)}`,
    })),
    ...failures.map((failure) => ({
      heading: failure.heading,
      value: null,
      label: `${deg(failure.heading)} — ${failure.error_type}`,
    })),
  ];

  const viewCards = views
    .map((view) => {
      const value = view.coverage?.tree_coverage_pct;
      const flags = view.quality_flags ?? [];
      return `
    <div class="view-card">
      <div class="view-card__head">
        <span class="view-card__heading">${deg(view.capture?.heading)}</span>
      </div>
      <div class="view-card__value${value == null ? " is-unavailable" : ""}">
        ${value == null ? esc(t("res.unavailable")) : `${nfDisplay(value)}<small>%</small>`}
      </div>
      <div class="view-card__meta">
        <span>${esc(t("res.group.vegetation"))} ${ratioPct(view.coverage?.vegetation_coverage_ratio)}</span>
        ${view.capture?.capture_date ? `<span>· ${esc(view.capture.capture_date)}</span>` : ""}
        ${flags.length ? `<span>· ${flags.length} ⚑</span>` : ""}
      </div>
    </div>`;
    })
    .join("");

  const failureCards = failures
    .map(
      (failure) => `
    <div class="view-card view-card--failed">
      <div class="view-card__head">
        <span class="view-card__heading">${deg(failure.heading)}</span>
        <span class="view-card__meta">${esc(t(`res.failure.${failure.stage}`) || failure.stage)}</span>
      </div>
      <div class="view-card__value is-unavailable">${esc(failure.error_type)}</div>
      <p class="view-card__meta">${esc(failure.message)}</p>
    </div>`
    )
    .join("");

  const compass = card(
    t("res.compass"),
    `
    ${compassPlot(points, {
      ariaLabel: t("res.compass"),
      ringLabel: "100%",
    })}
    <p class="card__note">${esc(t("res.compass.hint"))}</p>
    <div class="views-grid">${viewCards}${failureCards}</div>`
  );

  const statKeys = ["mean", "median", "p25", "p75", "iqr", "std", "min", "max"];
  const aggTable = card(
    t("res.aggregate"),
    `
    <div class="table-scroll">
      <table class="agg-table">
        <thead>
          <tr>
            <th scope="col"></th>
            ${statKeys.map((key) => `<th scope="col">${esc(t(`res.agg.${key}`))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">${esc(t("res.agg.tree"))}</th>
            ${statKeys.map((key) => `<td>${ratioPct(treeStats[key])}</td>`).join("")}
          </tr>
          <tr>
            <th scope="row">${esc(t("res.agg.vegetation"))}</th>
            ${statKeys.map((key) => `<td>${ratioPct(vegStats[key])}</td>`).join("")}
          </tr>
        </tbody>
      </table>
    </div>
    <p class="card__note">${esc(t("res.aggregate.hint"))}</p>`
  );

  const location = payload.location ?? {};
  const plan = payload.plan ?? {};
  const locationCard = card(
    t("res.capture"),
    datalist([
      [t("res.capture.address"), location.address ? esc(location.address) : null, true],
      [
        t("res.capture.coords"),
        location.lat != null && location.lon != null
          ? esc(`${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`)
          : null,
      ],
      [t("plan.mode"), esc(plan.mode)],
      [t("capture.referenceHeading"), plan.reference_heading != null ? deg(plan.reference_heading) : null],
      [t("plan.preview"), plan.planned_headings?.length ? esc(plan.planned_headings.map((h) => `${h}°`).join("  ")) : null],
      [t("res.capture.pitch"), plan.pitch != null ? deg(plan.pitch) : null],
      [t("res.capture.fov"), plan.fov != null ? deg(plan.fov) : null],
      [t("res.capture.size"), plan.size ? esc(plan.size) : null],
      [t("plan.minViews"), plan.min_successful_views != null ? esc(plan.min_successful_views) : null],
      [
        t("res.capture.pano"),
        views[0]?.capture?.pano_id ? esc(views[0].capture.pano_id) : null,
      ],
      [
        t("res.capture.date"),
        views[0]?.capture?.capture_date ? esc(views[0].capture.capture_date) : null,
      ],
      [
        "",
        location.lat != null && location.lon != null
          ? `<a href="https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}"
                target="_blank" rel="noopener noreferrer">${esc(t("res.capture.openMaps"))}</a>`
          : null,
        true,
      ],
    ])
  );

  container.innerHTML = [
    headline,
    compass,
    galleryCard(galleryEntries),
    aggTable,
    locationCard,
    provenanceCard(payload.backend_provenance, {
      classSpace: views[0]?.class_space,
      notes: views[0]?.backend_notes,
    }),
    flagsCard(aggregate.quality_flags),
    exportCard(payload, context),
  ]
    .filter(Boolean)
    .join("");

  wireGallery(container, galleryEntries);
}

/* --------------------------------------------------------- interactions -- */

/**
 * Gallery behaviour: one tab bar drives every tile at once, and a tile opens
 * the full tabbed viewer for its heading in a dialog.
 */
function wireGallery(root, entries) {
  const gallery = root.querySelector("[data-gallery]");
  if (!gallery) return;

  const tabs = [...gallery.querySelectorAll("[data-tab]")];
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const layer = tab.dataset.tab;
      tabs.forEach((other) => other.setAttribute("aria-selected", String(other === tab)));
      gallery.querySelectorAll("[data-layer]").forEach((img) => {
        img.hidden = img.dataset.layer !== layer;
      });
      // The mask reads as a silhouette, so it wants a black ground behind it.
      gallery.querySelectorAll(".tile .frame").forEach((frame) => {
        frame.classList.toggle("frame--mask", layer === "mask");
      });
    });
  });

  gallery.querySelectorAll("[data-view-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = entries[Number(button.dataset.viewIndex)];
      if (entry) openViewerDialog(entry);
    });
  });
}

/**
 * Opens one view at full size.
 *
 * A single dialog element is reused and its contents replaced on each opening,
 * so at most one view's imagery is ever held in the DOM. Cleanup is structural
 * rather than tied to the `close` event, which not every engine dispatches
 * reliably; base64 frames from a live API are heavy enough to be worth the
 * guarantee.
 */
let viewerDialog = null;

function openViewerDialog(entry) {
  if (!viewerDialog) {
    viewerDialog = document.createElement("dialog");
    viewerDialog.className = "dialog dialog--viewer";
    document.body.append(viewerDialog);
  }

  viewerDialog.innerHTML = `
    <form method="dialog" class="dialog__close-form">
      <button class="icon-btn" aria-label="${esc(t("res.closeView"))}" value="close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" /></svg>
      </button>
    </form>
    <h2>${esc(t("res.view"))} ${deg(entry.view.capture?.heading)} —
        ${pct(entry.view.coverage?.tree_coverage_pct)}</h2>
    ${viewerMarkup(entry.images, entry.view.capture?.size)}`;

  wireViewer(viewerDialog);
  if (!viewerDialog.open) viewerDialog.showModal();
}

/** Drop the reused dialog when a new result replaces the one it belongs to. */
function resetViewerDialog() {
  if (!viewerDialog) return;
  if (viewerDialog.open) viewerDialog.close();
  viewerDialog.remove();
  viewerDialog = null;
}

/** Tab switching and the before/after slider for one view's imagery. */
function wireViewer(root) {
  const viewer = root.querySelector("[data-viewer]");
  if (!viewer) return;

  const tabs = [...viewer.querySelectorAll("[data-tab]")];
  const panels = [...viewer.querySelectorAll("[data-panel]")];
  const hint = viewer.querySelector("[data-compare-hint]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((other) => other.setAttribute("aria-selected", String(other === tab)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.tab;
      });
      if (hint) hint.hidden = tab.dataset.tab !== "compare";
    });
  });

  const range = viewer.querySelector(".compare__range");
  if (range) {
    const compare = range.closest(".compare");
    range.addEventListener("input", () => {
      compare.style.setProperty("--split", `${range.value}%`);
    });
  }
}
