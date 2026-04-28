self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('biblia-codex-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/index.css',
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return new Response('Offline', { status: 503 });
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'biblia-codex-v1') {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

self.addEventListener('push', (event) => {
  const data = event.data?.json()
  
  self.registration.showNotification(data?.title || 'Bíblia Codex', {
    body: data?.body || 'Novo conteúdo disponível!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})