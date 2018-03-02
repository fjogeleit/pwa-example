const STATIC_FILES = [
  '/',
  '/index.html',
  '/assets/js/app.js',
  '/assets/css/material.min.css',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
]

self.addEventListener('install', event => {
  console.log('Service Worker install', event);

  event.waitUntil((async () => {
    const cache = await caches.open('static_files')

    return cache.addAll(STATIC_FILES)
  })())
});

self.addEventListener('fetch', (event) => {
  // return static files from the cache
  if (arrayIncludes(event.request.url, STATIC_FILES) === true) {
    event.respondWith(
      caches.match(event.request)
    );

    return;
  }

  if (event.request.headers.get('accept').includes('application/json')) {
    // try to return new data, cache as fallback
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request)
        const cache = await caches.open('dynamic_files')

        cache.put(event.request.url, response.clone())
        console.log('Return from fetch %s', event.request.url)

        return response

      } catch (error) {
        const cached = await caches.match(event.request)

        if (cached) {
          console.log('Return from cache %s', event.request.url)
          return cached
        }

        throw error
      }
    })())

    return;
  }

  // fetch dynamic files the first time and return the second time from the cache
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      console.log('Dynamic Caching: %s', event.request.url)
      return fetch(event.request).then(result => caches
        .open('dynamic_files')
        .then(cache => {
          cache.put(event.request.url, result.clone());
          return result;
        })
      )
    })
  )
});

const arrayIncludes = (string, array) => {
  if (string.indexOf(self.origin) === -1) {
    return array.includes(string);
  }

  return array.includes(string.substr(self.origin.length));
}
