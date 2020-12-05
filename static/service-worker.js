// Version string to force reload after update
// v0.10.7

const CACHE_NAME = "siteCache";
const URLS_CACHE = [
    "/",
    "/style.css",
    "/spinner.svg",
    "/jquery-3.5.1.min.js",
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
        if (res) {
            return res;
        }

        return fetch(ev.request)/*.then(fetchRes => {
            // Check if we received a valid response
            if(!fetchRes || fetchRes.status !== 200 || fetchRes.type !== "basic") {
                return fetchRes;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = fetchRes.clone();

            caches.open(CACHE_NAME).then(cache => {
                cache.put(ev.request, responseToCache);
            });

            return fetchRes;
        });*/
    }));
});