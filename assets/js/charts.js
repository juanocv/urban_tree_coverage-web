/**
 * Inline-SVG chart primitives. No dependencies, no canvas.
 *
 * Every chart returns an SVG string that inherits theme colours through CSS
 * custom properties, so light/dark switching needs no re-render.
 */

const NS_LABEL = (text) => String(text).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const round = (value, places = 2) => Number(value.toFixed(places));

/** Polar to cartesian with 0° at the top, growing clockwise — a compass, not a maths circle. */
function polar(cx, cy, radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [round(cx + radius * Math.cos(radians)), round(cy + radius * Math.sin(radians))];
}

/**
 * Ring gauge for the headline indicator.
 * @param {object} opts
 * @param {number|null} opts.value      percentage in [0, 100], or null when unavailable
 * @param {string} opts.centerLabel     text drawn in the middle
 * @param {string} opts.ariaLabel
 * @param {string} [opts.tone]          CSS variable name for the arc colour
 */
export function ringGauge({ value, centerLabel, ariaLabel, tone = "--c-tree" }) {
  const size = 168;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = value == null ? 0 : clamp01(value / 100);
  const dash = round(circumference * fraction, 2);

  return `
<svg class="gauge" viewBox="0 0 ${size} ${size}" role="img" aria-label="${NS_LABEL(ariaLabel)}">
  <circle class="gauge__track" cx="${size / 2}" cy="${size / 2}" r="${round(radius)}"
          fill="none" stroke-width="${stroke}" />
  ${value == null ? "" : `
  <circle class="gauge__arc" cx="${size / 2}" cy="${size / 2}" r="${round(radius)}"
          fill="none" stroke="var(${tone})" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${dash} ${round(circumference - dash, 2)}"
          transform="rotate(-90 ${size / 2} ${size / 2})" />`}
  <text class="gauge__value" x="${size / 2}" y="${size / 2}" text-anchor="middle"
        dominant-baseline="central">${NS_LABEL(centerLabel)}</text>
</svg>`;
}

/**
 * Stacked horizontal bars, one per class group.
 * @param {Array<{label: string, value: number, tone: string}>} rows  value as a fraction in [0, 1]
 */
export function groupBars(rows) {
  if (!rows.length) return "";
  const items = rows
    .map(({ label, value, tone, display }) => {
      const width = round(clamp01(value) * 100, 2);
      return `
  <div class="bar">
    <div class="bar__head">
      <span class="bar__label"><i class="swatch" style="--swatch:var(${tone})"></i>${NS_LABEL(label)}</span>
      <span class="bar__value">${NS_LABEL(display)}</span>
    </div>
    <div class="bar__track" role="img" aria-label="${NS_LABEL(`${label}: ${display}`)}">
      <div class="bar__fill" style="width:${width}%;--swatch:var(${tone})"></div>
    </div>
  </div>`;
    })
    .join("");
  return `<div class="bars">${items}</div>`;
}

/**
 * Polar plot of coverage per heading. Radius encodes the value, angle the
 * compass heading, so the shape itself shows which way the canopy sits.
 * @param {Array<{heading: number|null, value: number|null, label: string}>} points
 */
export function compassPlot(points, { ariaLabel = "", ringLabel = "100%" } = {}) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const rMax = 108;
  const usable = points.filter((p) => p.heading != null && p.value != null);

  const rings = [0.25, 0.5, 0.75, 1]
    .map(
      (step) =>
        `<circle class="polar__ring${step === 1 ? " polar__ring--outer" : ""}" cx="${cx}" cy="${cy}" r="${round(rMax * step)}" fill="none" />`
    )
    .join("");

  const spokes = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((deg) => {
      const [x, y] = polar(cx, cy, rMax, deg);
      return `<line class="polar__spoke" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />`;
    })
    .join("");

  const cardinals = [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["W", 270],
  ]
    .map(([name, deg]) => {
      const [x, y] = polar(cx, cy, rMax + 18, deg);
      return `<text class="polar__cardinal" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${name}</text>`;
    })
    .join("");

  let shape = "";
  if (usable.length >= 3) {
    const path = usable
      .slice()
      .sort((a, b) => a.heading - b.heading)
      .map((p) => polar(cx, cy, rMax * clamp01(p.value / 100), p.heading).join(","))
      .join(" ");
    shape = `<polygon class="polar__area" points="${path}" />`;
  } else if (usable.length === 2) {
    const [a, b] = usable.map((p) => polar(cx, cy, rMax * clamp01(p.value / 100), p.heading));
    shape = `<line class="polar__edge" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" />`;
  }

  const markers = points
    .map((p) => {
      if (p.heading == null) return "";
      const failed = p.value == null;
      const radius = failed ? rMax : rMax * clamp01(p.value / 100);
      const [x, y] = polar(cx, cy, radius, p.heading);
      const [lx, ly] = polar(cx, cy, rMax + 34, p.heading);
      return `
    <g class="polar__point${failed ? " is-failed" : ""}">
      <line class="polar__stem" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />
      <circle cx="${x}" cy="${y}" r="5"><title>${NS_LABEL(p.label)}</title></circle>
      <text class="polar__tick" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central">${p.heading}°</text>
    </g>`;
    })
    .join("");

  return `
<svg class="polar" viewBox="0 0 ${size} ${size}" role="img" aria-label="${NS_LABEL(ariaLabel)}">
  ${rings}${spokes}${cardinals}${shape}${markers}
  <text class="polar__scale" x="${cx + 4}" y="${cy - rMax + 12}">${NS_LABEL(ringLabel)}</text>
</svg>`;
}

/**
 * Compact compass showing which headings a view plan will capture.
 * @param {number[]} headings
 * @param {number} reference
 */
export function headingDial(headings, reference) {
  const size = 108;
  const cx = size / 2;
  const cy = size / 2;
  const r = 40;

  const ticks = [0, 90, 180, 270]
    .map((deg) => {
      const [x1, y1] = polar(cx, cy, r - 5, deg);
      const [x2, y2] = polar(cx, cy, r, deg);
      return `<line class="dial__tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    })
    .join("");

  const refMark = Number.isFinite(reference)
    ? (() => {
        const [x, y] = polar(cx, cy, r - 2, reference);
        return `<line class="dial__reference" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />`;
      })()
    : "";

  const rays = headings
    .map((deg) => {
      const [x, y] = polar(cx, cy, r - 2, deg);
      const [dx, dy] = polar(cx, cy, r - 2, deg);
      return `<line class="dial__ray" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" /><circle class="dial__head" cx="${dx}" cy="${dy}" r="3.5" />`;
    })
    .join("");

  return `
<svg class="dial" viewBox="0 0 ${size} ${size}" role="img" aria-label="${NS_LABEL(headings.join("°, ") + "°")}">
  <circle class="dial__face" cx="${cx}" cy="${cy}" r="${r}" fill="none" />
  ${ticks}${refMark}${rays}
  <circle class="dial__hub" cx="${cx}" cy="${cy}" r="2.5" />
  <text class="dial__north" x="${cx}" y="${cy - r - 7}" text-anchor="middle">N</text>
</svg>`;
}

/**
 * Min–max whisker with an interquartile box and a median tick, drawn on a
 * fixed 0–100% scale so two runs can be compared by eye.
 */
export function spreadBar({ min, p25, median, p75, max, ariaLabel = "" }) {
  const width = 100;
  const height = 34;
  const pos = (value) => round(clamp01(value / 100) * width, 2);
  if ([min, p25, median, p75, max].some((v) => v == null)) return "";

  const mid = 17;
  return `
<svg class="spread" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"
     aria-label="${NS_LABEL(ariaLabel)}">
  <line class="spread__axis" x1="0" y1="${mid}" x2="${width}" y2="${mid}" vector-effect="non-scaling-stroke" />
  <line class="spread__whisker" x1="${pos(min)}" y1="${mid}" x2="${pos(max)}" y2="${mid}" vector-effect="non-scaling-stroke" />
  <line class="spread__cap" x1="${pos(min)}" y1="${mid - 6}" x2="${pos(min)}" y2="${mid + 6}" vector-effect="non-scaling-stroke" />
  <line class="spread__cap" x1="${pos(max)}" y1="${mid - 6}" x2="${pos(max)}" y2="${mid + 6}" vector-effect="non-scaling-stroke" />
  <rect class="spread__box" x="${pos(p25)}" y="${mid - 8}" width="${round(Math.max(pos(p75) - pos(p25), 0.4), 2)}" height="16" />
  <line class="spread__median" x1="${pos(median)}" y1="${mid - 10}" x2="${pos(median)}" y2="${mid + 10}" vector-effect="non-scaling-stroke" />
</svg>`;
}
