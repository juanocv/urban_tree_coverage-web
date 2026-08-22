> 🇧🇷 **Português:** [Leia esta página em português](README.pt-br.md)

# Urban Tree Coverage — web console

A static front end for the [Urban Tree Coverage](https://github.com/juanocv/urban_canopy)
web API. It takes a location, sends it to an API instance you are running, and
presents what comes back: the coverage indicator, the segmentation imagery, the
per-view spread, and the provenance that makes a number reproducible.

The site computes nothing. Every figure it shows was produced by the API, and a
value the API reports as unavailable is displayed as unavailable rather than
replaced by a substitute.

## What it does

**Inputs — required**

| Field | Notes |
|---|---|
| Location | Either an address (geocoded by the API) **or** a latitude/longitude pair. The two are mutually exclusive, exactly as the API requires. |
| View strategy | `Single view` → `POST /analyse/single`; `Multi-view` → `POST /analyse/multi`. |

**Inputs — optional**

| Field | Default | Applies to |
|---|---|---|
| `heading` | 0° | single |
| `reference_heading` | 0° | multi |
| `mode` (`offsets` / `equiangular`) | `offsets` | multi |
| `offsets` | `0, 90, 180, 270` | multi, `offsets` mode |
| `n_views` | 4 | multi, `equiangular` mode |
| `min_successful_views` | 1 | multi |
| `pitch` | 0° | both |
| `fov` | 90° | both |
| `size` | `640x640` | both |
| `refine` | on | both |
| `allow_vegetation_proxy` | off | both |
| `return_overlays` | on | both |

**Outputs**

- Tree coverage as a ring gauge and a headline percentage, with the vegetation
  figure beside it and a badge naming what the measurement came from
  (`tree class`, `vegetation proxy`, or `unavailable`).
- For a single view: the RGB frame, the tree overlay, the refined mask, and a
  drag-to-compare slider between the frame and the overlay.
- For multi-view: a compass plot whose radius is the per-heading coverage, one
  card per view, an interquartile spread bar, and the full aggregate table
  (mean, median, p25, p75, IQR, std, min, max) for both tree and vegetation.
- With `return_overlays` on, multi-view also shows one frame per heading in a
  gallery. A single tab bar drives every tile at once, so what the eye compares
  between headings is always the same layer; clicking a tile opens that heading
  full size with its own compare slider.
- Refinement accounting: raw area, refined area, components removed, holes
  filled, and whether the growth guard fired.
- Capture provenance (panorama id, capture date, coordinates) and backend
  provenance (backend, checkpoint, class space, device, checkpoint SHA-256,
  taxonomy and its source).
- Quality flags, each with an explanation of what it means.
- Export as JSON or CSV — the CSV uses the same column order as the CLI's
  `views.csv`, so exports interchange with `tree-ai` output — plus copy-as-cURL
  and a shareable link that restores the query.

The interface is bilingual (pt-BR / English), follows the system light/dark
theme with a manual override, and works down to a 375 px viewport.

## Running the API

The site is static and has no backend of its own. Start the API from the
[urban_canopy](https://github.com/juanocv/urban_canopy) repository:

```bash
python -m pip install -e ".[api,ml]"
uvicorn urban_canopy.webapi:app --host 127.0.0.1 --port 8000
```

Then allow this site's origin in the API's CORS settings, in `.env`:

```bash
UC_API_CORS_ORIGINS=https://juanocv.github.io
```

Paste the API address into the **API connection** field. It is remembered in
`localStorage`, and `?api=http://127.0.0.1:8000` overrides it per link.

Overlays dominate the response size — roughly a megabyte of PNG per frame, three
frames per view — so `/analyse/multi` refuses plans above
`UC_API_MAX_OVERLAY_VIEWS` (default 8) when imagery is requested. The console
warns before you submit such a plan, but the server stays authoritative: raise
that setting and a larger sweep works.

> The API has no authentication and calls a paid Google API on every request.
> Keep it bound to localhost or behind a proxy.

### HTTPS and mixed content

A page served over HTTPS may only make plain-HTTP requests to `localhost` or
`127.0.0.1`, which browsers treat as trustworthy origins. That combination —
this site on GitHub Pages, the API on your own machine — works. An API on
another host over plain HTTP is blocked by the browser; the site detects this
case and says so instead of failing silently. Serve such an API over HTTPS.

## Reaching it from anywhere

The console runs on GitHub Pages over HTTPS, so the API it calls must be
reachable over HTTPS too — a browser will not let an HTTPS page call plain HTTP
on anything but `localhost`. A public IPv4 alone does not solve that: trusted
certificates are issued for names, not bare addresses.

The path that needs neither a public IP nor an open router port is a Cloudflare
Tunnel: an outbound connection from the machine that already runs the model, with
TLS and a hostname handled for you.

### 1. Turn on authentication

Generate a token and put it in the API's `.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

```bash
UC_API_TOKENS=<the-token-you-generated>
UC_API_CORS_ORIGINS=https://juanocv.github.io
```

`UC_API_TOKENS` takes a comma-separated list, so each person or machine can hold
a distinct token and you can revoke one without disturbing the others. With it
set, `/ready` and both `/analyse` endpoints require
`Authorization: Bearer <token>`; `GET /ping` stays open so uptime checks and the
tunnel's own health probe keep working. Startup logs which mode is active — if
the log says authentication is OFF, the instance is open to whoever finds it.

### 2. Start the API bound to localhost

```bash
uvicorn urban_canopy.webapi:app --host 127.0.0.1 --port 8000
```

Keep `127.0.0.1`. The tunnel connects from the same machine, so the API never
needs to listen on a public interface.

### 3. Expose it through the tunnel

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

That prints a `https://<random>.trycloudflare.com` address, which is enough to
test from another network right away. For an address that survives restarts,
create a named tunnel against a domain you control:

```bash
cloudflared tunnel login
cloudflared tunnel create urban-canopy
cloudflared tunnel route dns urban-canopy canopy.example.org
cloudflared tunnel run urban-canopy
```

### 4. Point the console at it

Open the site, put `https://canopy.example.org` in **API address** and the token
in **Access token**, then press **Test connection**. Both are remembered in this
browser's `localStorage`.

The token is deliberately never written into the repository, the query string or
the shareable link — a static site cannot keep a secret, so the secret belongs to
the person using it, not to the deployment. **Copy cURL** follows the same rule:
it emits `$UC_API_TOKEN` rather than the literal value.

### What this does and does not protect

A bearer token behind TLS stops strangers from spending your Google Street View
quota, which is the main risk of putting this online. It is not a full access
control system:

- **No rate limiting.** `UC_API_MAX_CONCURRENCY` bounds how many inferences run
  at once, not how many a token holder may run in a day. Set a budget cap in the
  Google Cloud console, and add a Cloudflare rate-limiting rule if the endpoint
  is shared.
- **A token is a bearer secret.** Anyone holding it is you. Rotate by editing
  `UC_API_TOKENS` and restarting.
- **Cloudflare Access** can sit in front of the tunnel for real identity (Google
  or GitHub sign-in, per-person policies) if a shared token is not enough. The
  console's token field would then be unused, and browser calls would need
  `credentials` handling that the current CORS setup does not enable.
- **Street View imagery** reaches whoever can call the endpoint. Overlays embed
  Google imagery, which carries redistribution terms worth reading before opening
  it up widely.
- **The machine has to be on.** The tunnel dies with it.

## Trying it without an API

**Load example** renders stored results from a real pipeline run — a single view
and a four-heading sweep, complete with imagery — through the same renderer a
live response uses. The figures came out of this project's own code; the frames
are the four-heading sample sweep the `urban_canopy` repository publishes under
`samples/images/`. Coverage across that sweep runs from 0.80% to 31.97%, which
is enough contrast to show what the comparison is for.

## Local development

No build step, no dependencies, no bundler — plain ES modules.

```bash
python -m http.server 4173
```

```text
index.html              markup and the full input surface
assets/css/app.css      design tokens, layout, components
assets/js/i18n.js       pt-BR / English copy and the translation pass
assets/js/api.js        API client; normalises failures into ApiError
assets/js/charts.js     inline-SVG gauge, bars, compass, spread bar
assets/js/render.js     payload → results DOM
assets/js/demo.js       stored example payloads
assets/js/app.js        form state, validation, requests, exports
```

`assets/js/app.js` mirrors `urban_canopy.core.viewplan.plan_headings` so the
compass preview can show which headings a run will capture before it costs
anything. The API stays the authority: whatever it plans is what the result
reports.

## Deployment

Pushing to `main` publishes the repository root through
`.github/workflows/pages.yml`. Enable it once under **Settings → Pages →
Source → GitHub Actions**. A `.nojekyll` file keeps Jekyll out of the way.

## Generative AI usage transparency

Generative AI tools were used to support the development of this site, including
discussing implementation alternatives, reviewing and organising code, and
reviewing documentation. Suggestions produced with these tools were reviewed,
adapted and validated by the author, who remains responsible for the contents of
this repository.

## Licence

Apache 2.0, matching the upstream project.
