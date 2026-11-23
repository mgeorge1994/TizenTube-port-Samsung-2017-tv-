#!/usr/bin/env python3
"""Build the green, standalone TizenTube-style wrapper widget.

Input:  ~/youtube/wrapper-src   (clean copy of the TizenTube widget)
Brand:  ~/youtube/frontend/img  (our green YouTube tile artwork)
Output: ~/youtube/app           (widget root to package with `tizen package`)
"""
from pathlib import Path
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "wrapper-src"
BRAND = ROOT / "frontend" / "img"
APP = ROOT / "app"

APP_ID = "GmLaunch02.TyzenTube"
PACKAGE = "GmLaunch02"
SERVICE_ID = f"{PACKAGE}.StandaloneService"
CONTENT_DIR = "/home/owner/share/youtube-content"

CONFIG = f'''<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns:tizen="http://tizen.org/ns/widgets" xmlns="http://www.w3.org/ns/widgets" id="https://youtube.local/app" version="1.0.0" viewmodes="maximized">
    <access origin="*" subdomains="true"></access>
    <tizen:allow-navigation href="*"/>
    <tizen:application id="{APP_ID}" package="{PACKAGE}" required_version="3.0"/>
    <author href="https://youtube.local">YouTube</author>
    <content src="index.html"/>
    <feature name="http://tizen.org/feature/screen.size.all"/>
    <feature name="http://tizen.org/feature/web.service"/>
    <icon src="icon_16b9.png" width="1920" height="1080"/>
    <icon src="icon.png" width="1024" height="1024"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/prelaunch.support" value="true"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/floating.navigation" value="false"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/use.game.mode" value="true"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/use.uwe" value="true"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/no_use_process_pool" value="true"/>
    <tizen:metadata key="multiview_support" value="true"/>
    <tizen:metadata key="multiview_min_resource" value="FHD+"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/html5.4k.support" value="true"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/microphone.support" value="1"/>
    <tizen:metadata key="http://samsung.com/tv/metadata/microphone.area" value="open"/>
    <name>YouTube</name>
    <tizen:privilege name="http://tizen.org/privilege/internet"/>
    <tizen:privilege name="http://developer.samsung.com/privilege/network.public"/>
    <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
    <tizen:privilege name="http://tizen.org/privilege/recorder"/>
    <tizen:privilege name="http://tizen.org/privilege/mediacapture"/>
    <tizen:privilege name="http://tizen.org/privilege/unlimitedstorage"/>
    <tizen:privilege name="http://tizen.org/privilege/application.launch"/>
    <tizen:profile name="tv-samsung"/>
    <tizen:service id="{SERVICE_ID}" auto-restart="true" on-boot="true">
        <tizen:content src="service/dist/index.js"/>
        <tizen:name>StandaloneService</tizen:name>
        <tizen:description>StandaloneService</tizen:description>
    </tizen:service>
    <tizen:setting screen-orientation="landscape" context-menu="enable" background-support="enable" encryption="disable" install-location="auto" hwkey-event="enable"/>
</widget>
'''

INDEX = r'''<!DOCTYPE html>
<head>
    <style>
        @keyframes indeterminate-bar {
            0% { left: 0%; width: 0; }
            50% { left: 0%; width: 100%; }
            100% { left: 100%; width: 0; }
        }
        .progress-container {
            position: relative; width: 300px; height: 4px; margin-top: 40px;
            background-color: rgba(0, 230, 118, 0.3); border-radius: 2px; overflow: hidden;
        }
        .progress-bar {
            position: absolute; top: 0; left: 0; height: 100%;
            background-color: #00E676;
            animation: indeterminate-bar 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
    </style>
    <script>
        "use strict";
        tizen.tvinputdevice.registerKey("ColorF0Red");
        tizen.tvinputdevice.registerKey("ColorF1Green");
        tizen.tvinputdevice.registerKey("ColorF2Yellow");
        tizen.tvinputdevice.registerKey("ColorF3Blue");
        const keys = ["MediaPlayPause", "MediaPlay", "MediaPause", "MediaStop",
            "MediaFastForward", "MediaRewind", "MediaTrackNext", "MediaTrackPrevious"];
        for (let i = 0; i < keys.length; i++) tizen.tvinputdevice.registerKey(keys[i]);

        const pkgId = tizen.application.getCurrentApplication().appInfo.packageId;
        const serviceId = pkgId + ".StandaloneService";

        function useInjectorOrProxy() {
            const data = tizen.application.getCurrentApplication().getRequestedAppControl().appControl.data;
            let args;
            try { args = JSON.parse(data[0].value[0]).args; } catch (e) {}
            fetch('http://localhost:8100/tizentube/getState')
                .then(r => r.json())
                .then(res => {
                    if (res.canConnectToDaemon && !res.isConnecting) {
                        fetch(`http://localhost:8100/tizentube/debugger${args ? `?${args}` : ''}`);
                        tizen.application.getCurrentApplication().exit();
                    } else if (!res.canConnectToDaemon) {
                        location.href = `http://localhost:8100/tv?additionalDataUrl=http%3A%2F%2Flocalhost%3A8100%2Fdial%2Fapps%2FYouTube${args ? `&${args}` : ''}`;
                    }
                }).catch(() => window.location.reload());
        }

        tizen.application.launchAppControl(
            new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/service"),
            serviceId,
            function () { useInjectorOrProxy(); },
            function (e) { alert("Launch Service failed: " + e.message); }
        );
    </script>
</head>
<body style="background-color: #000000; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0;">
    <h1 style="color: #FFFFFF; font-size: 80px; font-family: Roboto,Noto Sans CJK ZH-HK,Noto Sans Thai,Arial,Helvetica,sans-serif; margin: 0;">YouTube</h1>
    <div class="progress-container"><div class="progress-bar"></div></div>
</body>
</html>
'''

TRANSFORMS = [
    ("tizentube-ca", "youtube-ca"),
    ("tizentube-content", "youtube-content"),
    ("TizenTubeStandalone", "TyzenTube"),
]


def make_icons():
    shutil.copyfile(BRAND / "tile-1920x1080.png", APP / "icon_16b9.png")
    src = Image.open(BRAND / "tile-512x423.png").convert("RGB")
    canvas = Image.new("RGB", (1024, 1024), "black")
    w = int(1024 * 0.94)
    h = int(w * 423 / 512)
    im = src.resize((w, h), Image.Resampling.LANCZOS)
    canvas.paste(im, ((1024 - w) // 2, (1024 - h) // 2))
    canvas.save(APP / "icon.png", optimize=True)


def main():
    if APP.exists():
        shutil.rmtree(APP)
    APP.mkdir(parents=True)

    shutil.copytree(SRC / "service", APP / "service")
    for path in sorted((APP / "service").rglob("*")):
        if path.is_file() and path.suffix.lower() in {".js", ".json"}:
            text = path.read_text(encoding="utf-8")
            for old, new in TRANSFORMS:
                text = text.replace(old, new)
            path.write_text(text, encoding="utf-8")

    (APP / "config.xml").write_text(CONFIG, encoding="utf-8")
    (APP / "index.html").write_text(INDEX, encoding="utf-8")
    make_icons()
    print(f"built {APP}: {APP_ID}, service {SERVICE_ID}, green #00E676 icons")


if __name__ == "__main__":
    main()
