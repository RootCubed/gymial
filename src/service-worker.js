// Version string to force reload after update
const VERSION = "v0.15.1"

// resources
import "./static/apple-touch-icon.png";
import "./static/logo_512.png";

const CACHE_NAME = "siteCache";
const URLS_CACHE = [
    "/"
];

self.addEventListener("message", function (event) {
    if (event.data.action == "skipWaiting") {
        self.skipWaiting();
    }
});

self.addEventListener("install", ev => {
    ev.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_CACHE)));
});

self.addEventListener("activate", ev => {

});

self.addEventListener("fetch", ev => {
    if (!navigator.onLine && ev.request.url.includes("resources")) {
        ev.respondWith(new Response(JSON.stringify({
            "offline": true,
            "data": []
        })));
        return;
    }
    ev.respondWith(caches.match(ev.request).then(res => {
        // Cache hit - return response
        if (res && self.location.hostname == "gymial.ch") {
            return res;
        }

        return fetch(ev.request);
    }));
});
