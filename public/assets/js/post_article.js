(async () => {
  const db = await idb.open('article-store', 1, function (db) {
    if (!db.objectStoreNames.contains('new-article')) {
      db.createObjectStore('new-article', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('saved-article')) {
      db.createObjectStore('saved-article', { keyPath: 'id' });
    }
  });

  const saveArticle = (title, text) => {
    const transaction = db.transaction('new-article', 'readwrite')

    transaction.objectStore('new-article').put({
      id: Date.now(),
      title,
      text
    })

    return transaction.complete
  }

  const registerArticle = async (title, text) => {
    await saveArticle(title, text)

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const serviceWorker = await navigator.serviceWorker.ready

      return serviceWorker.sync.register('sync-posted-articles');
    }
  };

  const articleForm = document.querySelector('#article-form')

  articleForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.querySelector('#title');
    const text = document.querySelector('#text');

    if (!title.value || !text.value) {
      return;
    }

    await registerArticle(title.value, text.value)

    title.parentElement.classList.remove('is-dirty')
    text.parentElement.classList.remove('is-dirty')
    title.value = '';
    text.value = '';
  });
})()
