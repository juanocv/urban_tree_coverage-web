/**
 * Client for the urban_canopy web API.
 *
 * The site is static, so every call crosses an origin boundary: the API must
 * allow this page's origin through `UC_API_CORS_ORIGINS`. Failures are
 * normalised into `ApiError` so the UI can tell a validation refusal from an
 * unreachable server without inspecting fetch internals.
 */

import { t } from "./i18n.js";

export const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class ApiError extends Error {
  /**
   * @param {string} message  human-readable summary
   * @param {object} [opts]
   * @param {"network"|"mixed-content"|"validation"|"busy"|"not-ready"|"multiview"|"server"|"aborted"|"unauthorized"} [opts.kind]
   * @param {number} [opts.status]
   * @param {unknown} [opts.detail]  the parsed `detail` field, when present
   */
  constructor(message, { kind = "server", status = 0, detail = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }
}

/** A hostname the browser could actually resolve: DNS name, IPv4, or bracketed IPv6. */
const HOSTNAME_RE = /^(\[[0-9a-f:.]+\]|[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*)$/i;

/**
 * Trim a user-typed base URL down to `scheme://host[:port]` with no trailing
 * slash, returning "" for anything that is not a usable origin. `new URL` alone
 * is too permissive here: it happily percent-encodes free text into a hostname,
 * which would turn a typo into a confusing network error instead of a
 * "fill this in properly" message.
 */
export function normaliseBaseUrl(input) {
  const text = String(input ?? "").trim();
  if (!text) return "";
  const withScheme = /^https?:\/\//i.test(text) ? text : `http://${text}`;
  try {
    const url = new URL(withScheme);
    if (!HOSTNAME_RE.test(url.hostname)) return "";
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
}

/** True for origins a browser treats as trustworthy despite plain HTTP. */
export function isLocalHost(baseUrl) {
  try {
    const { hostname } = new URL(baseUrl);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

/**
 * Would the browser refuse this call as mixed content?
 * An HTTPS page may only reach HTTP on a locally-trusted host.
 */
export function isMixedContent(baseUrl) {
  return (
    location.protocol === "https:" &&
    baseUrl.startsWith("http://") &&
    !isLocalHost(baseUrl)
  );
}

/** Flatten FastAPI's 422 body into one readable line. */
function describeValidationDetail(detail) {
  if (typeof detail === "string") return detail;
  if (!Array.isArray(detail)) return "";
  return detail
    .map((item) => {
      const field = Array.isArray(item?.loc)
        ? item.loc.filter((part) => part !== "body").join(".")
        : "";
      const message = item?.msg ?? "";
      return field ? `${field}: ${message}` : message;
    })
    .filter(Boolean)
    .join(" · ");
}

async function request(baseUrl, path, { method = "GET", body, token, signal, timeoutMs } = {}) {
  if (isMixedContent(baseUrl)) {
    throw new ApiError(t("err.mixedContent"), { kind: "mixed-content" });
  }

  // Compose the caller's signal with a timeout so a hung server still resolves.
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer = timeoutMs ? setTimeout(() => controller.abort("timeout"), timeoutMs) : null;

  // A bearer header rather than a cookie: it needs no `credentials` mode, so the
  // API can keep a permissive CORS policy without granting ambient authority to
  // every page the browser happens to have open.
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
      mode: "cors",
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted) throw new ApiError(t("err.aborted"), { kind: "aborted" });
    throw new ApiError(t("err.network", { url: baseUrl }), { kind: "network" });
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }

  const payload = await response.json().catch(() => null);
  if (response.ok) return payload;

  const detail = payload?.detail ?? null;

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(t(token ? "err.unauthorized" : "err.tokenRequired"), {
      kind: "unauthorized",
      status: response.status,
      detail,
    });
  }
  if (response.status === 422) {
    const described = describeValidationDetail(detail);
    throw new ApiError(described || t("err.validation"), {
      kind: "validation",
      status: 422,
      detail,
    });
  }
  if (response.status === 502 && detail && typeof detail === "object") {
    // MultiViewAnalysisError: too few headings produced a usable result.
    throw new ApiError(t("err.multiview"), { kind: "multiview", status: 502, detail });
  }
  if (response.status === 503) {
    const notReady = typeof detail === "string" && detail.toLowerCase().includes("not ready");
    throw new ApiError(notReady ? t("err.notReady") : t("err.busy"), {
      kind: notReady ? "not-ready" : "busy",
      status: 503,
      detail,
    });
  }

  const message = typeof detail === "string" ? detail : `HTTP ${response.status}`;
  throw new ApiError(message, { kind: "server", status: response.status, detail });
}

export function ping(baseUrl, options = {}) {
  // The server leaves /ping open, so the token stays home: one less place the
  // secret travels, and the probe stays a simple request with no preflight.
  const { token, ...rest } = options;
  return request(baseUrl, "/ping", { timeoutMs: 8000, ...rest });
}

export function ready(baseUrl, options = {}) {
  return request(baseUrl, "/ready", { timeoutMs: 15000, ...options });
}

export function analyseSingle(baseUrl, body, options = {}) {
  return request(baseUrl, "/analyse/single", { method: "POST", body, ...options });
}

export function analyseMulti(baseUrl, body, options = {}) {
  return request(baseUrl, "/analyse/multi", { method: "POST", body, ...options });
}

/**
 * Liveness plus readiness in one probe.
 * @returns {Promise<{state: "online"|"degraded", backend: object|null}>}
 */
export async function probe(baseUrl, options = {}) {
  await ping(baseUrl, options);
  try {
    const payload = await ready(baseUrl, options);
    return {
      state: "online",
      backend: payload?.backend ?? null,
      // Older instances answered /ready without a backend listing; an empty
      // array leaves the caller's provisional list in place.
      backends: payload?.backends ?? [],
      defaultBackend: payload?.default_backend ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.kind === "not-ready") {
      return { state: "degraded", backend: null, backends: [], defaultBackend: null };
    }
    throw error;
  }
}

/**
 * A copy-pasteable cURL invocation for the request the form just built.
 *
 * The token is referenced as a shell variable rather than interpolated: this
 * string routinely ends up in issues, chat messages and shell history, and a
 * bearer secret should not travel along with it.
 */
export function toCurl(baseUrl, path, body, { authenticated = false } = {}) {
  const json = JSON.stringify(body, null, 2).replace(/'/g, `'\\''`);
  return [
    ...(authenticated ? ["# export UC_API_TOKEN=your-token"] : []),
    `curl -X POST '${baseUrl}${path}' \\`,
    ...(authenticated ? ['  -H "Authorization: Bearer $UC_API_TOKEN" \\'] : []),
    `  -H 'Content-Type: application/json' \\`,
    `  -d '${json}'`,
  ].join("\n");
}
