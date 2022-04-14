// Version string to force reload after update
const VERSION = "v1.0beta-1";

// resources
import "./static/apple-touch-icon.png";
import "./static/logo_512.png";

const CACHE_NAME = "siteCache";

self.addEventListener("message", function (event) {
    if (event.data.action == "skipWaiting") {
        self.skipWaiting();
    }
});

self.addEventListener("install", ev => {
    caches.delete(CACHE_NAME);
});

self.addEventListener("activate", ev => {});

self.addEventListener("fetch", ev => {
    if (!navigator.onLine && ev.request.url.includes("resources")) {
        ev.respondWith(new Response(JSON.stringify({
            "offline": true,
            "data": []
        }))); // TODO: actually cache last timetable
        return;
    }
    if (ev.request.url.match(/\/.+?\/.*/g) || !ev.request.url.includes("gymial.ch")) {
        // not a static resource or on localhost, DO NOT cache!
        ev.respondWith(fetch(ev.request));
    } else {
        ev.respondWith(caches.open(CACHE_NAME).then(async cache => {
            const response = await cache.match(ev.request);
            if (response) return response;
            const res = await fetch(ev.request);
            cache.put(ev.request, res.clone());
            return res;
          })
        );
    }
});
