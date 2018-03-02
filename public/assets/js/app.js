if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => {
      console.log('Service worker registered!');
    })
    .catch((err) => {
      console.log(err);
    });
}

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

})()
