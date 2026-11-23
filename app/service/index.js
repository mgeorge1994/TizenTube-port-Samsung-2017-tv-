"use strict";

// TizenTube Standalone service

const express = require('express');
const app = express();
const PORT = 8100;
console.log('NODE_VERSION ' + process.version);
process.on('uncaughtException', function (e) { console.error('UNCAUGHT ' + (e && e.stack || e)); });
console.log = (...args) => { (global.__ttlog = global.__ttlog || []).push(args.join(' ')); if (global.__ttlog.length > 800) global.__ttlog.shift(); };
console.error = (...args) => { (global.__ttlog = global.__ttlog || []).push('ERR ' + args.join(' ')); if (global.__ttlog.length > 800) global.__ttlog.shift(); };
const fetch = require('node-fetch');
const cobaltSetup = require('./utils/cobaltSetup.js');
const startServer = require('./utils/cobaltProxyServer.js');
const URL = require('url');
const path = require('path');
const injector = require('./utils/injector.js');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

/* ===== player fallback (ANDROID client proxy) v2 ===== */
var ytZlib = require('zlib');
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
function ytDecodeBody(buf, enc) {
  enc = String(enc || '').toLowerCase();
  try {
    if (enc.indexOf('gzip') !== -1) return ytZlib.gunzipSync(buf);
    if (enc.indexOf('deflate') !== -1) return ytZlib.inflateSync(buf);
    if (enc.indexOf('br') !== -1 && ytZlib.brotliDecompressSync) return ytZlib.brotliDecompressSync(buf);
  } catch (e) { console.error('PLAYER_BODY_DECODE_FAIL enc=' + enc + ' ' + e); }
  if (buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
    try { return ytZlib.gunzipSync(buf); } catch (e2) {}
  }
  return buf;
}
/* Android stream URLs carry an `n` value that is already valid. Hide it from the
   TV player (which would run its own n-transform on it) and restore it in the proxy. */
function ytHideN(u) { return String(u).replace(/([?&])n=/, '$1ttn='); }
function ytFixMediaUrl(u) { return String(u).replace(/([?&])ttn=/, '$1n='); }
function ytIsTizenFriendly(f) {
  var m = String(f.mimeType || '');
  return m.indexOf('avc1') !== -1 || m.indexOf('mp4a') !== -1;
}
function ytShapeAndroid(androidText, tvJson) {
  var j = JSON.parse(androidText);
  var sd = j.streamingData || {};
  var muxed = (sd.formats || []).filter(function (f) { return f.url && ytIsTizenFriendly(f); });
  var adaptive = (sd.adaptiveFormats || []).filter(function (f) { return f.url && ytIsTizenFriendly(f); });
  muxed.forEach(function (f) { f.url = ytHideN(f.url); });
  adaptive.forEach(function (f) { f.url = ytHideN(f.url); });
  sd.formats = muxed;
  sd.adaptiveFormats = adaptive;
  delete sd.serverAbrStreamingUrl;
  j.streamingData = sd;
  delete j.adPlacements; delete j.playerAds; delete j.adSlots; delete j.adBreakHeartbeatParams;
  if (tvJson && tvJson.responseContext) j.responseContext = tvJson.responseContext;
  return { text: JSON.stringify(j), muxed: muxed.length, adaptive: adaptive.length, status: (j.playabilityStatus || {}).status || 'UNKNOWN' };
}
function ytFetchAndroid(videoId) {
  return fetch(YT_PLAYER_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': YT_PLAYER_UA,
      'x-youtube-client-name': '3',
      'x-youtube-client-version': YT_ANDROID_CLIENT.clientVersion
    },
    body: new Buffer(JSON.stringify({
      context: { client: { hl: 'en', gl: 'US', clientName: YT_ANDROID_CLIENT.clientName,
        clientVersion: YT_ANDROID_CLIENT.clientVersion, androidSdkVersion: YT_ANDROID_CLIENT.androidSdkVersion,
        osName: YT_ANDROID_CLIENT.osName, osVersion: YT_ANDROID_CLIENT.osVersion, model: YT_ANDROID_CLIENT.model } },
      videoId: videoId, contentCheckOk: true, racyCheckOk: true
    }))
  }).then(function (r) { return r.text(); });
}
app.all('/youtubei/v1/player', function (req, res) {
  var chunks = [];
  req.on('data', function (c) { chunks.push(c); });
  req.on('end', function () {
    var rawBuf = Buffer.concat(chunks);
    var enc = req.headers['content-encoding'] || '';
    var bodyBuf = ytDecodeBody(rawBuf, enc);
    var raw = bodyBuf.toString('utf8');
    var videoId = '';
    try { videoId = JSON.parse(raw).videoId || ''; } catch (e) {}
    if (!videoId) { var m = /"videoId"\s*:\s*"([A-Za-z0-9_-]{11})"/.exec(raw); if (m) videoId = m[1]; }
    console.log('PLAYER_INTERCEPT videoId=' + videoId + ' ct=' + (req.headers['content-type'] || '') +
      ' enc=' + enc + ' in=' + rawBuf.length + ' decoded=' + bodyBuf.length);
    if (!videoId) console.log('PLAYER_NO_VIDEOID head=' + JSON.stringify(raw.slice(0, 160)));

    var headers = {};
    for (var k in req.headers) {
      if (Object.prototype.hasOwnProperty.call(req.headers, k)) {
        if (k === 'cookie') {
          headers[k] = req.headers[k].replace(/__LocalSecure-/g, '__Secure-').replace(/__LocalHost-/g, '__Host-');
        } else {
          headers[k] = req.headers[k];
        }
      }
    }
    delete headers['content-encoding'];
    delete headers['content-length'];
    headers['accept-encoding'] = 'gzip, deflate';
    headers['host'] = 'www.youtube.com';
    headers['origin'] = 'https://www.youtube.com';
    if (headers['referer']) headers['referer'] = 'https://www.youtube.com/tv';
    var qs = req.url.indexOf('?') !== -1 ? req.url.substring(req.url.indexOf('?')) : '?prettyPrint=false';

    fetch('https://www.youtube.com/youtubei/v1/player' + qs, {
      method: 'POST', headers: headers, body: bodyBuf, redirect: 'manual'
    })
      .then(function (r) { return r.text().then(function (t) { return { status: r.status, text: t }; }); })
      .then(function (orig) {
        var st = 'UNKNOWN', n = 0, tvJson = null;
        try {
          tvJson = JSON.parse(orig.text);
          st = (tvJson.playabilityStatus || {}).status || 'UNKNOWN';
          var sd = tvJson.streamingData || {};
          n = (sd.formats || []).length + (sd.adaptiveFormats || []).length;
        } catch (e) {}
        console.log('PLAYER_TV http=' + orig.status + ' status=' + st + ' formats=' + n);
        if ((st === 'OK' && n > 0) || !videoId) {
          ytSend(res, orig.status, ytRewriteMedia(orig.text));
          return;
        }
        console.log('PLAYER_FALLBACK_ANDROID');
        return ytFetchAndroid(videoId).then(function (t) {
          var shaped;
          try { shaped = ytShapeAndroid(t, tvJson); } catch (e) {
            console.error('PLAYER_ANDROID_PARSE_FAIL ' + e + ' head=' + JSON.stringify(String(t).slice(0, 160)));
            ytSend(res, orig.status, ytRewriteMedia(orig.text));
            return;
          }
          console.log('PLAYER_ANDROID status=' + shaped.status + ' muxed=' + shaped.muxed + ' adaptive=' + shaped.adaptive);
          if (shaped.status !== 'OK' || (shaped.muxed + shaped.adaptive) === 0) {
            ytSend(res, orig.status, ytRewriteMedia(orig.text));
            return;
          }
          ytSend(res, 200, ytRewriteMedia(shaped.text));
        });
      })
      .catch(function (e) {
        console.error('PLAYER_FALLBACK_FAIL ' + (e && e.stack || e));
        if (!res.headersSent) ytSend(res, 502, '{}');
      });
  });
});
/* media requests to googlevideo: restore n, use Android UA for Android URLs, drop browser headers */
function ytPrepMedia(targetUrl, headers) {
  var u = ytFixMediaUrl(targetUrl);
  delete headers['origin'];
  delete headers['referer'];
  delete headers['cookie'];
  if (/[?&]c=ANDROID(&|$)/.test(u)) headers['user-agent'] = YT_PLAYER_UA;
  return u;
}
var ytMediaLogCount = 0;

app.get('/tizentube/getState', (req, res) => {
    injector.canConnectToDaemon().then(r => {
        res.json(r);
    });
});

app.get('/tizentube/debugger', (req, res) => {
    const args = req.originalUrl.split('?')[1] || '';
    const interval = setInterval(() => {
        tizen.application.getAppsContext((appsContext) => {
            const packageId = tizen.application.getAppInfo().packageId;
            const app = appsContext.find(app => app.appId === `${packageId}.TyzenTube`);
            if (!app) {
                injector.startDebugger(args);
                clearInterval(interval)
            }
        });
    }, 50);
});

const ttUserScript = require('./dist/userScript.js');
app.get('/tizentube/userScript.js', (req, res) => {
    console.log('USERSCRIPT_SERVED ' + req.originalUrl); 
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(ttUserScript);
});
app.get('/tizentube/log', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send((global.__ttlog || []).join('\n'));
});
app.all('*', (req, res) => {
    const isCorsBypass = req.path.indexOf('/cors-bypass/') === 0;

    let targetUrl;
    if (isCorsBypass) {
        const rawTarget = req.url.substring('/cors-bypass/'.length);
        targetUrl = rawTarget.indexOf('http') === 0 ? rawTarget : `https://${rawTarget}`;
    } else {
        targetUrl = `https://www.youtube.com${req.url}`;
    }

    const headers = {};
    for (const key in req.headers) {
        if (Object.prototype.hasOwnProperty.call(req.headers, key)) {
            if (key === 'cookie') {
                headers[key] = req.headers[key]
                    .replace(/__LocalSecure-/g, '__Secure-')
                    .replace(/__LocalHost-/g, '__Host-');
                continue;
            }
            headers[key] = req.headers[key]
        }
    }

    try {
        const parsedUrl = URL.parse(targetUrl);
        headers['host'] = parsedUrl.host;
    } catch (e) {
        headers['host'] = isCorsBypass ? 'www.youtube.com' : 'www.youtube.com';
    }

    headers['origin'] = 'https://www.youtube.com';
    if (headers['referer']) {
        headers['referer'] = 'https://www.youtube.com/tv';
    }

    headers['accept-encoding'] = 'gzip, deflate';
    if (isCorsBypass && targetUrl.indexOf('googlevideo.com') !== -1) {
        targetUrl = ytPrepMedia(targetUrl, headers);
        if (ytMediaLogCount++ < 40) console.log('MEDIA_REQ ' + req.method + ' ' + targetUrl.slice(0, 160) + ' range=' + (headers['range'] || ''));
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].indexOf(req.method) !== -1;
    const fetchOptions = {
        method: req.method,
        headers: headers,
        body: hasBody ? req : undefined,
        redirect: 'manual'
    };

    fetch(targetUrl, fetchOptions)
        .then((response) => {
            if (isCorsBypass && targetUrl.indexOf('googlevideo.com') !== -1 && ytMediaLogCount < 60) {
                ytMediaLogCount++; console.log('MEDIA_RES ' + response.status + ' ' + (response.headers.get('content-type') || '') + ' len=' + (response.headers.get('content-length') || ''));
            }
            if (req.method === 'OPTIONS') {
                res.status(200);
            } else {
                res.status(response.status);
            }

            const headerKeys = response.headers.raw();
            for (const key in headerKeys) {
                if (Object.prototype.hasOwnProperty.call(headerKeys, key)) {
                    const lowerKey = key.toLowerCase();
                    const skipHeaders = ['content-encoding', 'content-length', 'transfer-encoding', 'content-security-policy', 'alt-svc'];
                    if (isCorsBypass) skipHeaders.push('access-control-allow-origin');

                    if (skipHeaders.indexOf(lowerKey) !== -1) continue;

                    const value = response.headers.get(key);
                    if (lowerKey === 'set-cookie') {
                        const rawCookies = headerKeys[key];
                        if (Array.isArray(rawCookies)) {
                            const modifiedCookies = rawCookies.map(cookieStr => {
                                return cookieStr
                                    .replace(/^__Secure-/i, '__LocalSecure-')
                                    .replace(/^__Host-/i, '__LocalHost-')
                                    .replace(/Domain=[^;]+/i, 'Domain=localhost')
                                    .replace(/;\s*Secure/i, '')
                                    .replace(/;\s*SameSite=None/i, '')
                                    .replace(/;\s*;/g, ';')
                                    .replace(/;\s*$/, '');
                            });
                            res.setHeader('Set-Cookie', modifiedCookies);
                            continue;
                        }
                    }

                    res.setHeader(key, value);
                }
            }

            res.setHeader('Access-Control-Allow-Origin', '*');

            const contentType = response.headers.get('content-type') || '';

            if (contentType.indexOf('text/html') !== -1 ||
                contentType.indexOf('application/json') !== -1 ||
                contentType.indexOf('javascript') !== -1 ||
                contentType.indexOf('text/css') !== -1) {

                return response.text().then((text) => {
                    if (req.url.indexOf('/tv') === 0 && req.url.indexOf('/tv_config') === -1) {
                        // Insert the userscript for TizenTube
                        text += `<script src="http://localhost:${PORT}/tizentube/userScript.js?ver=${Date.now()}"></script>`;
                    }

                    const proxyPrefix = `http://localhost:${PORT}/cors-bypass/`;

                    // Rewrite rules for replacing URLs so CORS and presumably YT is happy.
                    text = text.replace(/https:\/\/([a-zA-Z0-9-.]+)\.googlevideo\.com/g, `${proxyPrefix}https://$1.googlevideo.com`);
                    text = text.replace(/https:\\\/\\\/([a-zA-Z0-9-.]+)\.googlevideo\.com/g, `http:\\\/\\\/localhost:${PORT}\\\/cors-bypass\\\/https:\\\/\\\/$1.googlevideo.com`);
                    text = text.replace(/"\/\/([a-zA-Z0-9-.]+)\.googlevideo\.com/g, `"${proxyPrefix}https://$1.googlevideo.com`);

                    text = text.replace(/https:\/\/www\.gstatic\.com/g, `${proxyPrefix}https://www.gstatic.com`);
                    text = text.replace(/http:\/\/www\.gstatic\.com/g, `${proxyPrefix}https://www.gstatic.com`);
                    text = text.replace(/"\/\/www\.gstatic\.com/g, `"${proxyPrefix}https://www.gstatic.com`);
                    text = text.replace(/\(\/\/www\.gstatic\.com/g, `(${proxyPrefix}https://www.gstatic.com`);

                    text = text.replace(/https:\/\/yt3\.ggpht\.com/g, `${proxyPrefix}https://yt3.ggpht.com`);

                    text = text.replace(/https:\/\/clients1\.google\.com/g, `${proxyPrefix}https://clients1.google.com`);
                    text = text.replace(/http:\/\/clients1\.google\.com/g, `${proxyPrefix}https://clients1.google.com`);
                    text = text.replace(/"\/\/clients1\.google\.com/g, `"${proxyPrefix}https://clients1.google.com`);

                    text = text.replace('Set(["www.youtube.com","accounts.google.com"]);', 'Set(["www.youtube.com", "accounts.google.com", "localhost"]);');
                    text = text.replace(/:document\.location\.toString\(\)/g, ':document.location.toString().replace("http://localhost:${PORT}", "https://www.youtube.com")');
                    text = text.replace(/euri:[^,]+,/g, 'euri:document.location.toString().replace("http://localhost:${PORT}", "https://www.youtube.com"),')
                    text = text.replace(/https:\/\/s\.youtube\.com/g, `${proxyPrefix}https://s.youtube.com`);
                    text = text.replace(/redirector.googlevideo.com/g, `${proxyPrefix}https://redirector.googlevideo.com`);
                    text = text.replace(/this.scheme="https"/, 'this.scheme="http"');
                    text = text.replace(/https\:\/\/jnn-pa.googleapis.com/g, `${proxyPrefix}https://jnn-pa.googleapis.com`);
                    text = text.replace(/https:\/\/yt3\.googleusercontent\.com/g, `${proxyPrefix}https://yt3.googleusercontent.com`);
                    text = text.replace(/"\/\/yt3\.googleusercontent\.com/g, `"${proxyPrefix}https://yt3.googleusercontent.com`);

                    // In order to fix history not working
                    text = text.replace(/=window\.location\.href;/, '=window.location.href.replace("http://localhost:${PORT}", "https://www.youtube.com");')
                    text = text.replace(/=document\.location\.href/, '=document.location.href.replace("http://localhost:${PORT}", "https://www.youtube.com")')

                    res.send(text);
                });
            } else {
                if (response.body) {
                    response.body.pipe(res);
                } else {
                    res.end();
                }
            }
        })
        .catch((error) => {
            console.error(`Proxy Error for [${targetUrl}]: ${error}`);
            console.error(error.stack)
            if (!res.headersSent) {
                res.status(500).send('Proxy Connection Broken');
            }
        });
});

app.listen(PORT, '0.0.0.0');
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
}

// To avoid issues on newer versions of Tizen.
module.exports = {
    onStart: () => {},
    onRequest: () => {},
    onStop: () => {}
};