(() => {
  (async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js')
        console.log('Service worker registered!')
      } catch (error) {
        console.log(error)
      }
    }
  })()

  const closeMenu = () => {
    $('.mdl-layout__drawer, .mdl-layout__obfuscator').removeClass('is-visible')
  }

  if ('Notification' in window && navigator.serviceWorker) {
    Notification.requestPermission((status) => {
      console.log('Notification permission status:', status);
    });

    const welcome = async () => {
      if (Notification.permission === 'granted') {
        const serviceWorker = await navigator.serviceWorker.ready

        return serviceWorker.showNotification('Hello DresdenJS!', {
          body: 'Welcome to my PWA talk!',
          icon: 'assets/icons/icon192x192.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          }
        });
      }
    };

    const notificationLink = document.querySelector('#helloNotification');

    notificationLink.addEventListener('click', async event => {
      event.preventDefault()
      await welcome()

      closeMenu()
    });
  }
})();
