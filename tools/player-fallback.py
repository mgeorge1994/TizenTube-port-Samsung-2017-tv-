#!/usr/bin/env python3
"""On-TV player fallback.

YouTube's TVHTML5 client is bot-gated on this connection, so the stock TV
player response has no streams. Intercept /youtubei/v1/player, keep the TV's
own response when it is playable, otherwise substitute a response obtained
with the proven ANDROID client profile (same one the working bridge uses).

Inserted inline into both the source service and the ncc bundle so no new
runtime module resolution is needed on the TV.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SERVICE = ROOT / "wrapper-src" / "service"
FILES = [SERVICE / "dist" / "index.js", SERVICE / "index.js"]
ANCHOR = "app.get('/tizentube/getState'"

ROUTE = r'''/* ===== player fallback (ANDROID client proxy) ===== */
var YT_PLAYER_ENDPOINT = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false&alt=json';
var YT_ANDROID_CLIENT = { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 30, osName: 'Android', osVersion: '11', model: 'SM-G991B' };
var YT_PLAYER_UA = 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip';
function ytRewriteMedia(text) {
  var prefix = 'http://localhost:' + PORT + '/cors-bypass/';
  text = text.replace(/https:\/\/([a-zA-Z0-9-.]+)\.googlevideo\.com/g, prefix + 'https://$1.googlevideo.com');
  text = text.replace(/https:\\\/\\\/([a-zA-Z0-9-.]+)\.googlevideo\.com/g, 'http:\\\/\\\/localhost:' + PORT + '\\\/cors-bypass\\\/https:\\\/\\\/$1.googlevideo.com');
  return text;
}
function ytSend(res, status, text) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(text);
}
app.all('/youtubei/v1/player', function (req, res) {
  var chunks = [];
  req.on('data', function (c) { chunks.push(c); });
  req.on('end', function () {
    var raw = Buffer.concat(chunks).toString();
    var videoId = '';
    try { videoId = JSON.parse(raw).videoId || ''; } catch (e) {}
    console.log('PLAYER_INTERCEPT videoId=' + videoId);
    if (!videoId) { ytSend(res, 400, '{}'); return; }

    var headers = {};
    for (var k in req.headers) { if (Object.prototype.hasOwnProperty.call(req.headers, k)) headers[k] = req.headers[k]; }
    headers['accept-encoding'] = 'gzip, deflate';
    headers['host'] = 'www.youtube.com';
    headers['origin'] = 'https://www.youtube.com';

    fetch(YT_PLAYER_ENDPOINT, {
      method: 'POST', headers: headers, body: Buffer.from(raw), redirect: 'manual'
    })
      .then(function (r) { return r.text().then(function (t) { return { status: r.status, text: t }; }); })
      .then(function (orig) {
        var st = 'UNKNOWN', n = 0;
        try {
          var j = JSON.parse(orig.text);
          st = (j.playabilityStatus || {}).status || 'UNKNOWN';
          var sd = j.streamingData || {};
          n = (sd.formats || []).length + (sd.adaptiveFormats || []).length;
        } catch (e) {}
        console.log('PLAYER_TV status=' + st + ' formats=' + n);
        if (st === 'OK' && n > 0) {
          ytSend(res, orig.status, ytRewriteMedia(orig.text));
          return null;
        }
        console.log('PLAYER_FALLBACK_ANDROID');
        return fetch(YT_PLAYER_ENDPOINT, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'user-agent': YT_PLAYER_UA,
            'x-youtube-client-name': '3',
            'x-youtube-client-version': YT_ANDROID_CLIENT.clientVersion
          },
          body: JSON.stringify({
            context: { client: { hl: '', gl: 'US', clientName: YT_ANDROID_CLIENT.clientName,
              clientVersion: YT_ANDROID_CLIENT.clientVersion, androidSdkVersion: YT_ANDROID_CLIENT.androidSdkVersion,
              osName: YT_ANDROID_CLIENT.osName, osVersion: YT_ANDROID_CLIENT.osVersion, model: YT_ANDROID_CLIENT.model } },
            videoId: videoId, contentCheckOk: true, racyCheckOk: true
          })
        });
      })
      .then(function (r) {
        if (!r) return;
        return r.text().then(function (t) {
          var st = 'UNKNOWN', n = 0, u = '';
          try {
            var j = JSON.parse(t);
            st = (j.playabilityStatus || {}).status || 'UNKNOWN';
            var fs = (j.streamingData || {}).formats || [];
            n = fs.length + ((j.streamingData || {}).adaptiveFormats || []).length;
            u = String((fs[0] || {}).url || '').slice(0, 200);
          } catch (e) {}
          console.log('PLAYER_ANDROID status=' + st + ' formats=' + n + ' url=' + u);
          ytSend(res, 200, ytRewriteMedia(t));
        });
      })
      .catch(function (e) {
        console.error('PLAYER_FALLBACK_FAIL ' + e);
        if (!res.headersSent) ytSend(res, 502, '{}');
      });
  });
});

'''

USERSCRIPT_LOG = "console.log('USERSCRIPT_SERVED ' + req.originalUrl); "


def main():
    for path in FILES:
        text = path.read_text(encoding="utf-8")
        if "PLAYER_INTERCEPT" in text:
            raise SystemExit(f"player fallback already inserted in {path}")
        if text.count(ANCHOR) != 1:
            raise SystemExit(f"anchor count {text.count(ANCHOR)} in {path}")
        text = text.replace(ANCHOR, ROUTE + ANCHOR, 1)

        marker = "app.get('/tizentube/userScript.js', function (req, res) {"
        if marker in text:
            text = text.replace(marker, marker + "\n  " + USERSCRIPT_LOG, 1)
        else:
            marker2 = "app.get('/tizentube/userScript.js', (req, res) => {"
            if marker2 not in text:
                raise SystemExit(f"userscript route not found in {path}")
            text = text.replace(marker2, marker2 + "\n    " + USERSCRIPT_LOG, 1)

        path.write_text(text, encoding="utf-8")
        print(f"patched {path}")


if __name__ == "__main__":
    main()
