// ترقية الإصدار للنسخة الأقوى
const CACHE_NAME = "habib-clean-elite-v3"; 
const DYNAMIC_CACHE = "habib-clean-dynamic-v1"; // كاش ذكي للملفات الجديدة

// الملفات الأساسية فقط لضمان سرعة التثبيت
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./icon-512.png" // تأكد إن الصورة دي موجودة عندك بنفس الاسم
];

// 1. مرحلة التثبيت: تخزين الملفات الأساسية
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("🚀 Habib Clean Cache: Secured V3");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // تفعيل السيرفس وركر فوراً
});

// 2. مرحلة التفعيل: تنظيف أي كاش قديم (لتنظيف التطبيق عند العميل)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log("🧹 Cleaning Old Elite Cache...");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. استراتيجية جلب البيانات (The God-Tier Logic)
self.addEventListener("fetch", event => {
  // أ. بالنسبة لصفحات الموقع (HTML): الاستراتيجية -> Network First, Fallback to Cache
  // ده عشان العميل دايماً يشوف أحدث الأسعار والتعديلات اللي بتعملها
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // لو جاب أحدث نسخة من النت، يخزنها في الكاش للمستقبل
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // لو مفيش نت (أوفلاين)، رجعله النسخة المحفوظة من الكاش
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('./index.html');
          });
        })
    );
  } else {
    // ب. بالنسبة للملفات الثابتة (صور، خطوط، ستايل): الاستراتيجية -> Cache First, Fallback to Network
    // لسرعة تحميل صاروخية وتوفير باقة العميل
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        // لو الملف في الكاش، رجعه فوراً
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // لو مش في الكاش، هاته من النت وخزنه ديناميكياً
        return fetch(event.request).then(response => {
          // فلترة الأخطاء عشان نخزن الملفات السليمة بس
          if(!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
            return response;
          }
          
          let responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // هنا ممكن في المستقبل نرجع صورة Offline لو الصورة الأساسية فشلت
          console.log("Network fetch failed and no cache available.");
        });
      })
    );
  }
});
