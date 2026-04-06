const CACHE_NAME = "habib-clean-elite-v2"; // تحديث الإصدار لضمان مسح الكاش القديم عند العميل
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./icon-512.png",
  "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap"
];

// مرحلة التثبيت: تخزين الملفات الأساسية
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Habib Clean Cache: Secured");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // تفعيل السيرفس وركر فوراً
});

// مرحلة التفعيل: تنظيف أي كاش قديم (عشان التصميم الجديد يظهر)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Cleaning Old Cache...");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// استراتيجية جلب البيانات: البحث في الكاش أولاً للسرعة، ثم الشبكة
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا وجد في الكاش رجعه فوراً (سرعة صاروخية)
      if (response) {
        return response;
      }
      // إذا لم يوجد، اطلبه من الشبكة
      return fetch(event.request);
    }).catch(() => {
      // هنا ممكن تضيف صفحة Offline لو حبيت مستقبلاً
    })
  );
});
