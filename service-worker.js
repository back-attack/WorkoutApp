const CACHE = "ai-trainer-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./workouts.html",
  "./nutrition.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./Designer.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});