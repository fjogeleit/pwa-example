// Read example data from an external api
(async () => {
  const addArticle = (article) => $('.page-content .mdl-grid').append(`
    <div class="mdl-cell mdl-cell--12-col">
      <div class="mdl-card mdl-shadow--2dp">
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">${article.title}</h2>
        </div>
        <div class="mdl-card__supporting-text">${article.body}</div>
      </div>
    </div>
  `)

  const db = await idb.open('article-store', 1, (db) => {
    if (!db.objectStoreNames.contains('posts')) {
      db.createObjectStore('new-article', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-posts')) {
      db.createObjectStore('saved-article', { keyPath: 'id' });
    }
  });

  const savedTransaction = db.transaction('saved-article', 'readonly')

  savedTransaction.objectStore('saved-article').getAll().then(articles => articles.reverse().map(article => {
    addArticle(article)
  }))

  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    headers: new Headers({
      'Accept': 'application/json; charset=utf-8'
    })
  })

  const body = await response.json()

  body.slice(0, 11).map((article) => addArticle(article))

  return savedTransaction.complete
})();
