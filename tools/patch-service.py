#!/usr/bin/env python3
"""Add LAN-accessible diagnostics to the bundled TizenTube service.

- expose proxy logs at /tizentube/log
- bind the 8100 proxy to 0.0.0.0 so we can inspect it from the Mac during QA
- make a missing Cobalt content directory non-fatal
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICE = ROOT / "wrapper-src" / "service"
BUNDLE = SERVICE / "dist" / "index.js"
SOURCE = SERVICE / "index.js"

LOG_SETUP = r'''console.log = function () { var s = Array.from(arguments).join(' '); (global.__ttlog = global.__ttlog || []).push(s); if (global.__ttlog.length > 800) global.__ttlog.shift(); };
console.error = function () { var s = 'ERR ' + Array.from(arguments).join(' '); (global.__ttlog = global.__ttlog || []).push(s); if (global.__ttlog.length > 800) global.__ttlog.shift(); };'''

SOURCE_LOG_SETUP = r'''console.log = (...args) => { (global.__ttlog = global.__ttlog || []).push(args.join(' ')); if (global.__ttlog.length > 800) global.__ttlog.shift(); };
console.error = (...args) => { (global.__ttlog = global.__ttlog || []).push('ERR ' + args.join(' ')); if (global.__ttlog.length > 800) global.__ttlog.shift(); };'''

LOG_ROUTE = r'''app.get('/tizentube/log', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send((global.__ttlog || []).join('\n'));
});
'''

SOURCE_LOG_ROUTE = r'''app.get('/tizentube/log', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send((global.__ttlog || []).join('\n'));
});
'''

BUNDLE_FALLBACK_OLD = r'''app.listen(PORT, '127.0.0.1');
if (cobaltSetup()) {
  startServer();
} else {
  // Start the DIAL server
  global.isTizenTube = true;
  __nccwpck_require__(4507);
}'''

BUNDLE_FALLBACK_NEW = r'''app.listen(PORT, '0.0.0.0');
console.log('PROXY_LISTEN 0.0.0.0:' + PORT);
try {
  if (cobaltSetup()) {
    console.log('COBALT_SETUP_OK');
    startServer();
  } else {
    console.log('COBALT_SETUP_UNAVAILABLE - using widget proxy only');
  }
} catch (e) {
  console.error('COBALT_SETUP_FAIL ' + e);
}'''

SOURCE_FALLBACK_OLD = '''app.listen(PORT, '127.0.0.1');


if (cobaltSetup()) {
    startServer();
} else {
    // Start the DIAL server
    global.isTizenTube = true;
    require(path.join(__dirname, '../../../dist/service.js'));
}'''

SOURCE_FALLBACK_NEW = '''app.listen(PORT, '0.0.0.0');
console.log('PROXY_LISTEN 0.0.0.0:' + PORT);
try {
    if (cobaltSetup()) {
        console.log('COBALT_SETUP_OK');
        startServer();
    } else {
        console.log('COBALT_SETUP_UNAVAILABLE - using widget proxy only');
    }
} catch (e) {
    console.error('COBALT_SETUP_FAIL ' + e);
}'''


def patch(path, pairs):
    text = path.read_text(encoding="utf-8")
    for old, new in pairs:
        if old not in text:
            raise SystemExit(f"missing patch target in {path}: {old[:70]!r}")
        text = text.replace(old, new, 1)
    path.write_text(text, encoding="utf-8")
    print(f"patched {path}")


def main():
    patch(BUNDLE, [
        ("var app = express();\nvar PORT = 8100;",
         "var app = express();\nvar PORT = 8100;\n" + LOG_SETUP),
        ("app.all('*', function (req, res) {", LOG_ROUTE + "app.all('*', function (req, res) {"),
        ("  var isCorsBypass = req.path.indexOf('/cors-bypass/') === 0;",
         "  console.log('REQ ' + req.method + ' ' + req.url);\n  var isCorsBypass = req.path.indexOf('/cors-bypass/') === 0;"),
        (BUNDLE_FALLBACK_OLD, BUNDLE_FALLBACK_NEW),
    ])
    patch(SOURCE, [
        ("const app = express();\nconst PORT = 8100;",
         "const app = express();\nconst PORT = 8100;\n" + SOURCE_LOG_SETUP),
        ("app.all('*', (req, res) => {", SOURCE_LOG_ROUTE + "app.all('*', (req, res) => {"),
        (SOURCE_FALLBACK_OLD, SOURCE_FALLBACK_NEW),
    ])


if __name__ == "__main__":
    main()
