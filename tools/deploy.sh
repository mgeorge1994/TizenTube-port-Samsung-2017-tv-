#!/bin/bash
# Rebuild, reinstall and launch the green YouTube app (GmLaunch02.TyzenTube) only.
# Usage: TV_IP=<tv ip> bash tools/deploy.sh
set -e
TV_IP=${TV_IP:-192.168.0.235}
TV=$TV_IP:26101
ROOT=$(cd "$(dirname "$0")/.." && pwd)
export PATH="$HOME/tizen-studio/tools:$HOME/tizen-studio/tools/ide/bin:$PATH"
cd "$ROOT"
python3 tools/make-wrapper.py
rm -f youtube.wgt
tizen package -t wgt -s tvLauncher -- app
mv app/*.wgt youtube.wgt
sdb kill-server || true; sdb start-server; sdb connect "$TV"
tizen uninstall -s "$TV" -p GmLaunch02.TyzenTube || true
tizen install -s "$TV" -n "$ROOT/youtube.wgt" -- "$ROOT"
tizen run -s "$TV" -p GmLaunch02.TyzenTube -- "$ROOT"
sleep 8
curl -s "http://$TV_IP:8100/tizentube/log" | tail -5
echo "DEPLOY_OK - open a video on the TV, then check: curl -s http://$TV_IP:8100/tizentube/log | grep -E 'PLAYER_|MEDIA_|ERR'"
