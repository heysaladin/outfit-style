const CACHE = 'outfit-style-v1'

const PRECACHE = [
  '/',
  '/outfits',
  '/calendar',
  '/stats',
  '/declutter',
  '/login',
]

// Install — precache shell pages
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests from same origin or Next.js static
  if (request.method !== 'GET') return

  // Skip Supabase API, OAuth, external requests
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('remove.bg') ||
    url.origin !== self.location.origin
  ) return

  // Static assets (JS/CSS chunks) → cache first
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(cache => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // Navigation requests → network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    )
    return
  }
})
