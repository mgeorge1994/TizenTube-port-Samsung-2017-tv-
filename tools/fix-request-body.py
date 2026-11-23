#!/usr/bin/env python3
"""TizenTube's fetch wrapper re-issues POST Request objects to localhost and copies the
body only when `request.body` exists. Tizen 3.0's WebView has no Request.body
(ReadableStream), so every such POST (incl. /youtubei/v1/player) went out with an EMPTY
body. Always read the body via clone().arrayBuffer() instead."""
import pathlib
p = pathlib.Path(__file__).resolve().parent.parent / "wrapper-src/service/dist/userScript.js"
s = p.read_text()
old = 'return i.body&&!i.bodyUsed?(i.clone(),i.clone().arrayBuffer().then(function(e){return r.body=e,t(a,r)})):t(a,r)'
new = 'return!i.bodyUsed&&\\"GET\\"!==i.method&&\\"HEAD\\"!==i.method?i.clone().arrayBuffer().then(function(e){return e&&e.byteLength&&(r.body=e),t(a,r)}):t(a,r)'
if new in s:
    print("already patched")
else:
    assert s.count(old) == 1, "pattern not found"
    p.write_text(s.replace(old, new)); print("patched", p)
