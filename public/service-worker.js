const STATIC_FILES = [
  '/',
  '/index.html',
  '/welcome.html',
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
})

self.addEventListener('fetch', (event) => {
  // return static files from the cache
  if (arrayIncludes(event.request.url, STATIC_FILES) === true) {
    event.respondWith(caches.match(event.request))

    return
  }

  // try to return new data, cache as fallback
  if (event.request.headers.get('accept').includes('application/json')) {
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

    return
  }

  if (event.request.method === 'GET') {
    // fetch dynamic files the first time and return the second time from the cache
    event.respondWith((async () => {
      const response = await caches.match(event.request)

      if (response) return response;

      console.log('Dynamic Caching: %s', event.request.url)
      const result = await fetch(event.request)
      const cache = await caches.open('dynamic_files')

      cache.put(event.request.url, result.clone())

      return result
    })())
  }
})

// BackgroundSynchronisation
self.addEventListener('sync', event => {
  if(event.tag === 'sync-post') {
    event.waitUntil((async () => {
      try {
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ title: 'How to Sync', body: 'Sync with ServiceWorker' })
          })

        const body = await response.json()
        const clients = await event.currentTarget.clients.matchAll()

        clients.forEach(client => client.postMessage(body))
        console.log('Sync %s', body.title)

      } catch (error) {
        console.log(error)
      }
    })())
  }
})

self.addEventListener('notificationclick', event => {
  const notification = event.notification;

  event.waitUntil((async () => {
    const list = await event.currentTarget.clients.matchAll()

    const client = list.find(entry => console.log(entry) || entry.visibilityState === 'visible')

    if (client !== undefined) {
      client.navigate('https://pwa.webdev-jogeleit.de/welcome.html')
      client.focus()
    } else {
      clients.openWindow('https://pwa.webdev-jogeleit.de/welcome.html')
    }

    notification.close();
  })())
});

const arrayIncludes = (string, array) => {
  if (string.indexOf(self.origin) === -1) {
    return array.includes(string);
  }

  return array.includes(string.substr(self.origin.length));
}
