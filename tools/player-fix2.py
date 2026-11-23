#!/usr/bin/env python3
"""v2 player fallback: decode gzip request bodies (the real TV player sends gzipped
/player bodies, so videoId was empty and we returned 400), hide/restore `n` on Android
stream URLs, keep only H.264/AAC formats, strip ads, Android UA for googlevideo media."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "wrapper-src" / "service"
block = pathlib.Path(sys.argv[1]).read_text()
for name in ["index.js", "dist/index.js"]:
    p = root / name
    s = p.read_text()
    start = s.index("/* ===== player fallback (ANDROID client proxy)")
    end = s.index("app.get('/tizentube/getState'")
    s = s[:start] + block + s[end:]
    # media prep inside the generic proxy, right after accept-encoding is set
    anchor = "headers['accept-encoding'] = 'gzip, deflate';\n"
    gen = s.index("app.all('*'")
    i = s.index(anchor, gen) + len(anchor)
    if "ytPrepMedia(targetUrl" not in s[gen:]:
        s = s[:i] + ("    if (isCorsBypass && targetUrl.indexOf('googlevideo.com') !== -1) {\n"
                     "        targetUrl = ytPrepMedia(targetUrl, headers);\n"
                     "        if (ytMediaLogCount++ < 40) console.log('MEDIA_REQ ' + req.method + ' ' + targetUrl.slice(0, 160) + ' range=' + (headers['range'] || ''));\n"
                     "    }\n") + s[i:]
    # log media response status
    m = re.search(r"fetch\(targetUrl, fetchOptions\)\s*\.then\((function \(response\)|\(response\) =>) \{\n", s)
    if m and "MEDIA_RES" not in s:
        s = s[:m.end()] + ("            if (isCorsBypass && targetUrl.indexOf('googlevideo.com') !== -1 && ytMediaLogCount < 60) {\n"
                           "                ytMediaLogCount++; console.log('MEDIA_RES ' + response.status + ' ' + (response.headers.get('content-type') || '') + ' len=' + (response.headers.get('content-length') || ''));\n"
                           "            }\n") + s[m.end():]
    p.write_text(s)
    print("patched", p)
