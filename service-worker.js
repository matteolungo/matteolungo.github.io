let config = {
  version: 'v1::',
  precachingItems: [
    '/',
    './index.html',
    'style.css',
    'startgame.js',
    './res/icon-192x192.png',
    './res/icon-512x512.png',
    './res/win.mp3',
    './res/lose.mp3',
    './res/correct.mp3'
  ],
  blacklistCacheItems: [
    '/service-worker.js'
  ]
};

function cacheName(key, opts) {
  return `${opts.version}${key}`;
}

function addToCache(cacheKey, request, response) {
  if (response.ok) {
    let copy = response.clone();
    caches.open(cacheKey).then(cache => { cache.put(request, copy); });
  }
  return response;
}

function fetchFromCache(event) {
  return caches.match(event.request).then(response => {
    if (!response) {
      throw Error(`${event.request.url} not found in cache`);
    }
    return response;
  });
}

function offlineResponse(resourceType, opts) {
  if (resourceType === 'image')
    return new Response(opts.offlineImage, { headers: { 'Content-Type': 'image/svg+xml' } });
  if (resourceType === 'content')
    return caches.match(opts.offlinePage);
  return undefined;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName('static', config)).then(cache => cache.addAll(config.precachingItems))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  function clearCacheIfDifferent(event, opts) {
    return caches.keys().then(cacheKeys => {
      let oldCacheKeys = cacheKeys.filter(key => key.indexOf(opts.version) !== 0);
      let deletePromises = oldCacheKeys.map(oldKey => caches.delete(oldKey));
      return Promise.all(deletePromises);
    });
  }
  event.waitUntil(
    clearCacheIfDifferent(event, config).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  let request = event.request;
  let acceptHeader = request.headers.get('Accept');
  let url = new URL(request.url);
  let resourceType = 'static';
  let cacheKey;
  if (request.method !== 'GET') {
    return;
  }
  if (url.origin !== self.location.origin) {
    return;
  }
  if (config.blacklistCacheItems.length > 0 && config.blacklistCacheItems.indexOf(url.pathname) >= 0) {
    return;
  }
  if (acceptHeader.indexOf('text/html') !== -1) {
    resourceType = 'content';
  }
  else if (acceptHeader.indexOf('image') !== -1) {
    resourceType = 'image';
  }
  cacheKey = cacheName(resourceType, config);
  // Network First Strategy 
  if (resourceType === 'content') {
    event.respondWith(
      fetch(request)
        .then(response => addToCache(cacheKey, request, response))
        .catch(() => fetchFromCache(event))
        .catch(() => offlineResponse(resourceType, config))
    );
  }
  // Cache First Strategy
  else {
    event.respondWith(
      fetchFromCache(event)
        .catch(() => fetch(request))
        .then(response => addToCache(cacheKey, request, response))
        .catch(() => offlineResponse(resourceType, config))
    );
  }
});

self.addEventListener('message', event => {
  if (event.origin.startsWith(self.location.origin)) {
    if (event.data.type === 'CACHE_URLS') {
      event.waitUntil(
        caches.open(cacheName('image', config)).then(cache => cache.addAll(event.data.payload))
          .then(() => self.skipWaiting())
      );
    }
  }
});