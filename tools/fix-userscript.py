#!/usr/bin/env python3
"""Self-host the TizenTube userscript with the correct proxy port.

The published userscript hardcodes localhost:8099, while this wrapper's proxy
listens on 8100. Serving a patched local copy removes both the port mismatch
and the runtime dependency on jsDelivr.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICE = ROOT / "wrapper-src" / "service"
BUNDLE = SERVICE / "dist" / "index.js"
SOURCE = SERVICE / "index.js"
COBALT = SERVICE / "utils" / "cobaltProxyServer.js"
CDN = "https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js"

ROUTE = r'''var ttUserScript = require('./userScript.js');
app.get('/tizentube/userScript.js', function (req, res) {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(ttUserScript);
});
'''

SOURCE_ROUTE = r'''const ttUserScript = require('./dist/userScript.js');
app.get('/tizentube/userScript.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(ttUserScript);
});
'''


def replace(path, old, new, count=None):
    text = path.read_text(encoding="utf-8")
    n = text.count(old)
    if n == 0:
        raise SystemExit(f"missing target in {path}: {old[:80]!r}")
    text = text.replace(old, new) if count is None else text.replace(old, new, count)
    path.write_text(text, encoding="utf-8")
    print(f"{path}: replaced {n} x {old[:55]!r}")


def main():
    script = Path("/tmp/tizentube-user.js")
    if not script.exists():
        raise SystemExit("missing /tmp/tizentube-user.js (download first)")
    content = script.read_text(encoding="utf-8").replace("localhost:8099", "localhost:8100")
    (SERVICE / "dist" / "userScript.js").write_text(
        "module.exports = " + json.dumps(content) + ";\n", encoding="utf-8"
    )
    print("wrote patched local userscript")

    replace(BUNDLE, CDN, "http://localhost:${PORT}/tizentube/userScript.js")
    replace(BUNDLE, "app.get('/tizentube/log', function (req, res) {", ROUTE + "app.get('/tizentube/log', function (req, res) {", 1)
    replace(SOURCE, CDN, "http://localhost:${PORT}/tizentube/userScript.js")
    replace(SOURCE, "app.get('/tizentube/log', (req, res) => {", SOURCE_ROUTE + "app.get('/tizentube/log', (req, res) => {", 1)
    replace(COBALT, CDN, "http://localhost:8100/tizentube/userScript.js")


if __name__ == "__main__":
    main()
