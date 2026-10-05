// Somerset Language Centre — push notification service worker

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = { title: 'Somerset Language Centre', body: '', url: '/courses/b1-unit-1' }
  try { payload = { ...payload, ...JSON.parse(event.data.text()) } } catch {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'somerset-reminder',
      data: { url: payload.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
