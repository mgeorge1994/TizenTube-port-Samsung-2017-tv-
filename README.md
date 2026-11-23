# TizenTube port (Samsung 2017 TV)

A standalone, ad-free YouTube app for **Samsung Tizen 3.0 TVs (2017 models, e.g. UE50MU6102)**, built on top of [TizenTube](https://github.com/reisxd/TizenTube) and adapted so it runs entirely on the TV, with no computer or bridge server next to it.

> Unofficial project, experimental. Not affiliated with or endorsed by YouTube/Google or Samsung.

## How it works

The widget loads `youtube.com/tv` through a small Node service that runs **on the TV** (Tizen web service, port `8100`):

- injects the TizenTube userscript (ad blocking, SponsorBlock, etc.), served locally instead of from a CDN;
- proxies YouTube requests and rewrites `googlevideo.com` media URLs through the local proxy;
- intercepts `/youtubei/v1/player`: if the TV client is bot-gated (`LOGIN_REQUIRED`), it re-requests with an Android client profile and returns H.264/AAC formats the 2017 hardware can decode;
- exposes a diagnostic log at `http://<tv-ip>:8100/tizentube/log`.

Changes compared to upstream TizenTube for this TV:

- Cobalt-only metadata removed (the TV registered the app as a native alias and refused to launch it);
- non-fatal Cobalt setup (no Cobalt on Tizen 3.0), proxy bound to `0.0.0.0:8100`;
- userscript self-hosted and its port fixed (`8099` → `8100`);
- request-body fix for Tizen 3.0's WebView (no `Request.body` stream);
- gzip/deflate request decoding and the Android player fallback;
- green "YouTube" launcher identity (`GmLaunch02.TyzenTube`), installs alongside other YouTube apps.

## Layout

| Path | What it is |
| --- | --- |
| `wrapper-src/` | Source of truth: the TizenTube widget with the patches above (`service/` = on-TV Node service, `service/dist/` = built bundle + userscript) |
| `app/` | Generated widget root (built from `wrapper-src/` by `tools/make-wrapper.py`), the folder that gets packaged |
| `tools/` | `make-wrapper.py` (build `app/`), the patch scripts that were applied to `wrapper-src/`, `deploy.sh` |
| `frontend/` | Earlier bridge-based UI (kept for reference / the green artwork used by `make-wrapper.py`) |

## Build and install

Requirements: TV in Developer Mode, [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html) with a Samsung certificate profile (scripts use `tvLauncher`), Python 3 with Pillow.

```sh
export PATH="$HOME/tizen-studio/tools:$HOME/tizen-studio/tools/ide/bin:$PATH"
python3 tools/make-wrapper.py
tizen package -t wgt -s tvLauncher -- app && mv app/*.wgt youtube.wgt

TV=<tv-ip>:26101
sdb connect $TV
tizen install -s $TV -n youtube.wgt -- .
tizen run -s $TV -p GmLaunch02.TyzenTube -- .
```

Check the service log: `curl -s http://<tv-ip>:8100/tizentube/log | tail -40`

## License

GPL-3.0, same as [TizenTube](https://github.com/reisxd/TizenTube) by reisxd, on which this is based. See [`LICENSE`](LICENSE).
