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
| `backend` | instance default | both |
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
- A backend selector listing what the connected instance offers, with the
  instance default marked and anything unusable disabled with its reason. The
  hint under it names the chosen backend's class space and says whether that
  space has a tree class at all — `deeplab` does not, which is the one case
  where **Allow vegetation as a tree proxy** changes the answer instead of
  changing nothing.
- Export as JSON or CSV — the CSV uses the same column order as the CLI's
  `views.csv`, so exports interchange with `tree-ai` output — plus copy-as-cURL
  and a shareable link that restores the query.

The interface is bilingual (pt-BR / English), follows the system light/dark
theme with a manual override, and works down to a 375 px viewport.

## Configuring the connection

Everything about reaching the API lives in one dialog, opened from the status
pill in the header — the pill doubles as the way in and as the readout, showing
**Not connected** until a test succeeds and **Connected** afterwards.

### The API address

The address is pre-filled from `assets/js/config.js`. A static page cannot read
`.env` at runtime — there is no server to read it and no build step to inline
it — so `config.js` is that file's published counterpart, written by
`scripts/sync-config.py`. Nothing secret belongs in it: every visitor receives
it. Only `UC_WEB_*` keys mean anything in this repository's `.env`;
`UC_API_TOKENS` and `UC_API_CORS_ORIGINS` are server settings and belong in the
`urban_canopy` `.env`, where the API actually reads them.

There are two ways to set the published address. Both use the same script, and
they can be combined.

**A repository variable, applied at deploy time.** The address never lives in
the repository at all. Under *Settings → Secrets and variables → Actions →
Variables*, add `UC_WEB_API_BASE_URL`; the Pages workflow regenerates
`config.js` from it on every deploy. Changing the address is then a settings
edit plus a re-run — no commit. A variable rather than a secret is the right
choice here: the address is served to every visitor anyway, and the token is
what actually guards the API.

**A committed `config.js`, generated locally.** Put the value in `.env`, run the
script, and commit the result:

```bash
UC_WEB_API_BASE_URL=https://urban-tree-coverage.tail6b2e17.ts.net
```

```bash
python scripts/sync-config.py
```

The environment variable wins over `.env` when both are set, which is what makes
the two compose: the committed file is the default, and CI overrides it when the
repository variable exists. When neither is set — a CI run with no variable
configured — the script leaves `config.js` exactly as committed, so a missing
variable can never silently replace a working address with `localhost`.

The field starts locked, because the published default is normally the right
one. **Change** unlocks it for that browser only; the value is remembered in
`localStorage` and the field re-locks whenever the dialog closes. If `config.js`
is later redeployed with a different address, a stale per-browser override is
discarded rather than silently shadowing the new default — otherwise editing
`.env` would appear to have no effect.

Two escape hatches remain: `?api=https://...` overrides everything for one link,
and clearing site data resets to the published default.

### The access token

Typed into the same dialog and kept in `localStorage`. It is deliberately never
written into the repository, the query string or the shareable link — a static
site cannot keep a secret, so the secret belongs to the person using it, not to
the deployment.

## Running the API

The site is static and has no backend of its own. Start the API from the
[urban_canopy](https://github.com/juanocv/urban_canopy) repository's fork:

```bash
python -m pip install -e ".[api,ml]"
uvicorn urban_canopy.webapi:app --host 127.0.0.1 --port 8000
```

Then allow this site's origin in the API's CORS settings, in `.env`:

```bash
UC_API_CORS_ORIGINS=https://your_user.github.io
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

Two tunnels solve that without a public IP or an open router port, both by
making an outbound connection from the machine that already runs the model.
Pick one:

| | Tailscale Funnel | Cloudflare Tunnel |
|---|---|---|
| Fixed address | yes, free | needs a domain you own (~US$10/yr) |
| Hostname | `machine.tailnet.ts.net` | any name on your domain |
| Starts with the machine | yes, `tailscaled` is already a service | needs `cloudflared service install` |
| Identity beyond a token | Tailscale ACLs | Cloudflare Access |

Cloudflare's quick tunnel (`--url`) is free but its address changes on every
restart, which makes it unsuitable as a published default. A permanent
Cloudflare hostname needs a domain in your account, because the CNAME to
`<UUID>.cfargotunnel.com` only resolves inside Cloudflare's network — free
subdomain services cannot stand in for it. Tailscale Funnel gives a stable
hostname with valid TLS at no cost, which is why it comes first below.

### 1. Turn on authentication

Generate a token and put it in the API's `.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

```bash
UC_API_TOKENS=<the-token-you-generated>
UC_API_CORS_ORIGINS=https://your_user.github.io
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

### 3. Expose it through a tunnel

**Tailscale Funnel** — a stable hostname, free, no domain required:

```bash
winget install --id tailscale.tailscale
```

```bash
tailscale funnel 8000
```

Funnel has to be enabled once in the tailnet ACLs; the command links to the
exact setting if it is not. The resulting
`https://<machine>.<tailnet>.ts.net` does not change between restarts, and
`tailscaled` already runs as a service, so the tunnel comes back with the
machine.

**Cloudflare Tunnel** — for a hostname on a domain you own. A throwaway address
to test with:

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

That prints a `https://<random>.trycloudflare.com` which lasts only as long as
the command runs. For a permanent one (included charges), against a domain in your Cloudflare
account:

```bash
cloudflared tunnel login
```

```bash
cloudflared tunnel create urban-canopy
```

```bash
cloudflared tunnel route dns urban-canopy canopy.example.org
```

Then write `~/.cloudflared/config.yml`, pointing the hostname at the local port
and ending with a catch-all rule, which `cloudflared` requires:

```yaml
tunnel: urban-canopy
credentials-file: C:/Users/you/.cloudflared/<UUID>.json

ingress:
  - hostname: canopy.example.org
    service: http://127.0.0.1:8000
  - service: http_status:404
```

```bash
cloudflared tunnel run urban-canopy
```

To survive reboots, install it as a service (elevated shell):

```bash
cloudflared service install
```

Either way the API itself is still a process you start; a tunnel service coming
back on boot does not bring `uvicorn` with it.

### 4. Point the console at it

Put the address in `.env`, regenerate `config.js`, and commit it:

```bash
python scripts/sync-config.py
```

Then open the site, click the status pill, paste the token into **Access token**
and press **Test connection**. The pill turns to **Connected**. For a one-off
address that should not become the published default, press **Change** and type
it instead.

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
- **Real identity** is available from either provider if a shared token is not
  enough: Cloudflare Access (Google or GitHub sign-in, per-person policies) or
  Tailscale ACLs. Both authenticate with cookies, so the console's token field
  would go unused and browser calls would need `credentials` handling that the
  current CORS setup does not enable.
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
assets/js/config.js     published defaults, generated from .env
assets/js/i18n.js       pt-BR / English copy and the translation pass
assets/js/api.js        API client; normalises failures into ApiError
assets/js/charts.js     inline-SVG gauge, bars, compass, spread bar
assets/js/render.js     payload → results DOM
assets/js/demo.js       stored example payloads
assets/js/app.js        form state, validation, requests, exports
scripts/sync-config.py  .env -> assets/js/config.js
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
