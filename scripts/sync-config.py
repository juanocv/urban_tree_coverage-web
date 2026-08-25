"""
Generate assets/js/config.js from UC_WEB_API_BASE_URL.

A static page cannot read .env at runtime, so the value is baked into a small
JavaScript file that the page loads.

The value is resolved from, in order:

1. the UC_WEB_API_BASE_URL environment variable -- how CI sets it, from a
   repository variable, so the address never has to live in the repository;
2. UC_WEB_API_BASE_URL in ./.env -- how a developer sets it locally;
3. nothing, in which case an existing config.js is left exactly as it is.

Step 3 matters: a CI run with no repository variable configured must not
silently replace a committed address with the localhost default.

    python scripts/sync-config.py            # write config.js
    python scripts/sync-config.py --check    # exit 1 if it is stale
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
CONFIG_FILE = ROOT / "assets" / "js" / "config.js"

DEFAULT_BASE_URL = "http://127.0.0.1:8000"
ENV_KEY = "UC_WEB_API_BASE_URL"

HEADER = '''/**
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
  apiBaseUrl: %s,
};
'''


def read_env(path: Path) -> dict[str, str]:
    """Minimal KEY=VALUE parser; quotes stripped, # comments ignored."""
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip().strip("'\"")
    return values


def render(base_url: str) -> str:
    return HEADER % json.dumps(base_url)


def resolve_base_url() -> tuple[str | None, str]:
    """The configured address and where it came from, or (None, "unset")."""
    from_environment = os.environ.get(ENV_KEY, "").strip()
    if from_environment:
        return from_environment, "environment"

    from_file = read_env(ENV_FILE).get(ENV_KEY, "").strip()
    if from_file:
        return from_file, ENV_FILE.name

    return None, "unset"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify config.js matches .env instead of rewriting it",
    )
    args = parser.parse_args()

    base_url, source = resolve_base_url()

    if base_url is None:
        if CONFIG_FILE.is_file():
            print(f"{ENV_KEY} is not set; keeping the committed config.js unchanged")
            return 0
        base_url, source = DEFAULT_BASE_URL, "built-in default"

    # The value lands in a public file and in every request the page makes;
    # a typo here is a confusing network error rather than a loud failure.
    if not re.match(r"^https?://[^\s/]+$", base_url):
        print(
            f"{ENV_KEY} must be scheme://host[:port] with no path; got {base_url!r}",
            file=sys.stderr,
        )
        return 2

    rendered = render(base_url)
    current = CONFIG_FILE.read_text(encoding="utf-8") if CONFIG_FILE.is_file() else ""

    if args.check:
        if current == rendered:
            print(f"config.js is up to date ({base_url}, from {source})")
            return 0
        print("config.js is stale; run: python scripts/sync-config.py", file=sys.stderr)
        return 1

    if current == rendered:
        print(f"config.js already matches {source} ({base_url})")
        return 0

    CONFIG_FILE.write_text(rendered, encoding="utf-8")
    print(f"wrote {CONFIG_FILE.relative_to(ROOT)} with apiBaseUrl = {base_url} (from {source})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
