// Version string to force reload after update
const VERSION = "none"

const CACHE_NAME = "siteCache";
const URLS_CACHE = [
    "/",
    "/style.css",
    "/spinner.svg",
    "/gymial.js",
    "/manifest.webmanifest",
    "/apple-touch-icon.png",
    "/logo_512.png",
    "/favicon.ico"
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
