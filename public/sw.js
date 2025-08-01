// AI 학습 코치 - 서비스 워커
const CACHE_NAME = 'ai-learning-coach-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
  );
});

// 페치 이벤트
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 발견되면 반환
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
}); 