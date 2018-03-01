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

  event.waitUntil(
    caches.open('static_files').then(cache => {
      console.log('Precaching...');
      cache.addAll(STATIC_FILES);
    })
  )
});

self.addEventListener('fetch', (event) => {
  // return static files from the cache
  if (arrayIncludes(event.request.url, STATIC_FILES) === true) {
    event.respondWith(
      caches.match(event.request)
    );

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
