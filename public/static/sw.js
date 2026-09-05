// এডুসব সার্ভিস ওয়ার্কার — PWA ইনস্টল + পুশ নোটিফিকেশন
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });

self.addEventListener('push', function(e) {
  var d = { title: 'এডুসব', body: 'নতুন নোটিস এসেছে', url: '/' };
  try { if (e.data) d = e.data.json(); } catch (_) {}
  e.waitUntil(
    self.registration.showNotification(d.title || 'এডুসব', {
      body: d.body || '',
      icon: '/static/icons/icon-192.png',
      badge: '/static/icons/icon-192.png',
      tag: 'edusob-notice',
      data: { url: d.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) !== -1 && 'focus' in list[i]) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
