importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.0.0-beta.2/workbox-sw.js");
importScripts("https://cdn.jsdelivr.net/npm/idb@2.1.0/lib/idb.min.js");

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([]);

self.addEventListener('fetch', (event) => {

  /**
   * Cache Strategy Network first, Cache fallback
   */
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

  /**
   * Cache Strategy Cache first, Network fallback
   */
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

/************************** BackgroundSync ************************************/

const clearNewArticles = (db) => {
  const clearTransaction = db.transaction('new-article', 'readwrite')

  clearTransaction.objectStore('new-article').clear()

  return clearTransaction.complete
}

/**
 * Using a fake API to send a post request
 * Save the response in a separate
 */
self.addEventListener('sync', event => {
  if(event.tag === 'sync-posted-articles') {
    event.waitUntil((async () => {
      const db = await idb.open('article-store', 1, function (db) {
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('new-article', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync-posts')) {
          db.createObjectStore('saved-article', { keyPath: 'id' });
        }
      });

      try {
        const newTransaction = db.transaction('new-article', 'readonly')

        await Promise.all((await newTransaction.objectStore('new-article').getAll()).map(async article => {
          const response = await fetch(
            'https://jsonplaceholder.typicode.com/posts',
            { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(article) }
          )

          const body = await response.json()
          const savedTransaction = db.transaction('saved-article', 'readwrite')

          await savedTransaction.objectStore('saved-article').put({
            id: Date.now(),
            title: body.title,
            body: body.text
          })
          console.log('Sync %s', body.title)

          return savedTransaction.complete
        }));

        clearNewArticles(db)

        const clients = await event.currentTarget.clients.matchAll()
        clients.forEach(client => client.postMessage({ title: 'New Articles saved' }))

      } catch (error) {
        console.log(error)
      }
    })())
  }
})

/***************************** Notification ***********************************/

self.addEventListener('notificationclick', event => {
  const notification = event.notification;

  event.waitUntil((async () => {
    const list = await event.currentTarget.clients.matchAll()

    const client = list.find(entry => entry.visibilityState === 'visible')

    if (client !== undefined) {
      client.navigate('https://pwa.webdev-jogeleit.de/welcome.html')
      client.focus()
    } else {
      clients.openWindow('https://pwa.webdev-jogeleit.de/welcome.html')
    }

    notification.close();
  })())
});
