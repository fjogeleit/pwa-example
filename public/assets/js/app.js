// Read example data from an external api
(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    headers: new Headers({
      'Accept': 'application/json; charset=utf-8'
    })
  })
  const body = await response.json()

  body.slice(0, 11).map((entry) => $('.page-content').append(`
    <div class="mdl-cell mdl-cell--12-col">
      <div class="mdl-card mdl-shadow--2dp">
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">${entry.title}</h2>
        </div>
        <div class="mdl-card__supporting-text">${entry.body}</div>
      </div>
    </div>
  `))
})();

(async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service worker registered!')
    } catch (error) {
      console.log(error)
    }
  }
})();

const registerSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const serviceWorker = await navigator.serviceWorker.ready

    return serviceWorker.sync.register('sync-work');
  }
};

const snackBarContainer = document.querySelector('#demo-toast-example')
const showButton = document.querySelector('#backgroundSync')

showButton.addEventListener('click', async () => {
  await registerSync()

  snackBarContainer.MaterialSnackbar.showSnackbar({ message: 'Background Task registered' })
});
