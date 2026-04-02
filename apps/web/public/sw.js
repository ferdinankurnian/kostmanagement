const CACHE_NAME = "kost-management-v1";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/logo192.png",
  "/logo512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // API requests: network-first
  if (url.pathname.startsWith("/api")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/");
        return cached || new Response("Offline", { status: 503 });
      }),
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          void caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse ?? networkResponse;
    }),
  );
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {
    body: "Ada update baru di Kost Management.",
    title: "Kost Management",
    url: "/",
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      badge: "/logo192.png",
      body: payload.body,
      data: {
        url: payload.url ?? "/",
      },
      icon: "/logo192.png",
      tag: payload.tag ?? "kost-management",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
