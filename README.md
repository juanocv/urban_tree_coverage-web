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
| `return_overlays` | on | single |

**Outputs**

- Tree coverage as a ring gauge and a headline percentage, with the vegetation
  figure beside it and a badge naming what the measurement came from
  (`tree class`, `vegetation proxy`, or `unavailable`).
- For a single view: the RGB frame, the tree overlay, the refined mask, and a
  drag-to-compare slider between the frame and the overlay.
- For multi-view: a compass plot whose radius is the per-heading coverage, one
  card per view, an interquartile spread bar, and the full aggregate table
  (mean, median, p25, p75, IQR, std, min, max) for both tree and vegetation.
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

> The API has no authentication and calls a paid Google API on every request.
> Keep it bound to localhost or behind a proxy.

### HTTPS and mixed content

A page served over HTTPS may only make plain-HTTP requests to `localhost` or
`127.0.0.1`, which browsers treat as trustworthy origins. That combination —
this site on GitHub Pages, the API on your own machine — works. An API on
another host over plain HTTP is blocked by the browser; the site detects this
case and says so instead of failing silently. Serve such an API over HTTPS.

## Trying it without an API

**Load example** renders stored results from two real pipeline runs, one single
view and one four-heading sweep, through the same renderer a live response uses.
The figures came out of `tree-ai`; the imagery is the curated sample frame the
`urban_canopy` repository publishes under `samples/images/`.

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
