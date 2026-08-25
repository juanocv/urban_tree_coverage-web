/**
 * Deployment defaults for this console.
 *
 * A static page cannot read a .env file: there is no server to read it and no
 * build step to inline it. This file is that .env's published counterpart --
 * generate it from one with `python scripts/sync-config.py`, and commit it, so
 * the address is already filled in for anyone who opens the site.
 *
 * Nothing secret belongs here. The file is served to every visitor. The API
 * address is not a secret; the bearer token is, and it stays in the browser
 * that typed it.
 */
window.UC_CONFIG = {
  // Pre-fills the "API address" field. The field starts locked; "Change"
  // unlocks it, and an address set by hand wins for that browser.
  apiBaseUrl: "https://urban-tree-coverage.tail6b2e17.ts.net",
};
