---
title: "Hogy kezeljük az offline állapotot?"
description: "Ha a kapcsolat rövid időre megszakad, a webes alkalmazás csak a böngésző offline képernyőjét tudja megjeleníteni. Kivéve, ha gondoskodunk offline elérhető adatokról. Ehhez meg kell ismerkednünk a service worker-ekkel és a böngésző által biztosított adattárolási lehetőségekkel."
date: 2026-07-10
tags: ["frontend", "security"]
---

<figure class="diagram2">
  <img src="/offline.webp" alt="Offline állapotot jelző értesítés egy mobilalkalmazásban" loading="lazy" />
  <figcaption>Példa egy offline állapotot jelző felhasználói visszajelzésre</figcaption>
</figure>

<br>

Az offline állapot kezelési stratégiája függ az alkalmazásunk típusától. Ha felhasználónk például beszáll a liftbe és elveszíti a kapcsolatot, bosszantó lehet, hogy emiatt nem olvashatja tovább a legutóbbi üzenetet vagy cikket. Ugyanakkor megérti, hogy nem indíthat pénzügyi műveleteket. Egy alkalmazáson belül is lehetnek funkciók, amelyeket támogathatunk offline és lehetnek olyanok, amiket nem. Nézzük meg, hogy amit szeretnénk megtartani, azt hogyan tehetjük meg. Ehhez a Progresszív Web Appok (PWA) eszközeihez nyúlhatunk, mint amilyen a service worker, a böngésző cache, az IndexedDB.

<br>

## Mi is az a service worker?

A service worker lényegében egy JavaScript fájl, amit a kódunk inicializál és egy köztes szereplőként (proxy) funkcionál a böngészőben futó kódunk és a szerverünk között. Például a szerver felé küldött hívásunkat el tudja fogni és eldöntheti, hogy mit kezd vele. Megteheti, hogy megvizsgálja, hogy a kért tartalom elérhető-e a böngésző cache-ben vagy a böngésző saját adattárolóiban. Ha igen, vissza tudja adni az előre eltárolt információt, ugyanakkor tovább is küldi a kérést, hogy a friss válasszal frissíteni lehessen a böngészőben tárolt adatokat. Ez a _elavult-amíg-újreérvényesítődik_ stratégia teljesítménynövelésre is használható, de akkor igazán izgalmas, amikor átmenetileg egyáltalán nem kapunk választ. Megszakad vagy nagyon gyenge az internetkapcsolat.  

<br>

A service worker csak titkosított kapcsolatot lehetővé tevő oldalon (HTTPS) használható, mivel minden jövőbeli kérést elfogó kontrollt szerez az origin felett, ami sikeres támadás esetén állandósított hozzáférést jelent az adott kontextusban, nem csak egyszeri adatlopást.  

<br>

A service worker egy külön szálon fut, és a böngésző eseményeire reagál. Ha új verzió kerül ki az alkalmazásból, a böngésző letölti és telepíti az új service workert, de az nem veszi át azonnal a régi helyét. Az éppen nyitva lévő oldalak továbbra is a korábbi verziót használják, az új pedig csak akkor aktiválódik, amikor a régi már nem vezérel egyetlen oldalt sem – ez a legtöbb esetben akkor történik meg, amikor bezárjuk, majd újra megnyitjuk az alkalmazást. Illetve ha manuálisan triggereljük a cserét. Ez lehet a devTools-ban vagy felugró ablakban. Ez utóbbit a felhasználó nem feltétlenül tudja értelmezni, így sokszor inkább érdemes megvárni, amíg újra betölti az oldalt.  

Használata egyszerűsíthető az infrastruktúránkhoz illeszkedő csomagokkal, például ilyen a __vite-plugin-pwa__ egy Vite alkalmazás esetében, ami __Workbox__-ot használ. A vite config fájl megfelelő kiegészítése után, a service worker regisztrálás lényegében egy függvényhívás:
```
useRegisterSW()
```
szemben a kézi megoldással — [Maximilian Schwarzmüller PWA kurzusából](https://www.udemy.com/course/progressive-web-app-pwa-the-complete-guide/learn/lecture/7824418#overview) adaptálva —, ahol eseményekre figyelünk.
```
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
           ... 
        ]);
      })
  )
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});
```

<br>

## Statikus és dinamikus adatok

Ahhoz, hogy egy funkció megmaradjon, az előre eltárolt dinamikus adatokon kívül szükség van azon statikus oldalakra is, amelyeket szintén elkérünk egy szervertől: index.html, CSS fájlok, betűk stb. Ezeket nevezzük az alkalmazás vázának és eltárolhatjuk a Cache Storage-ban.  
A dinamikus adatok tárolására használható a böngésző saját adatbázisa az IndexedDB, amelynek jelen jegyzet írásának időpontjában 96.92%-os a globális böngésző támogatottsága (az Opera Mini-n nem elérhető).

<br>

## IndexedDB

Egy objektum tárház, ahol kulcs-érték párokat tárolhatunk (NoSQL), de a localstorage-hoz képest itt nem szükséges a szerializáció, különböző típusú adatok átalakítás nélkül menthetőek.  
Ahogy a neve is enged rá következtetni, indexeket is definiálhatunk a gyorsabb keresés érdekében.  
Tranzakciók használatát szintén megengedi, de számolni kell némi lassulással.  
Használata nem bonyolult, de jelentősen leegyszerűsíthető olyan segítő csomagok használatával, mint amilyen a __idb-keyval__. Egy adat eltárolása a következőképpen néz ki:
```
await set(storeKey(postId), [...pending.entries()])
```

<br>

## Mire figyeljünk?

Nem érdemes hirtelen túl sok mindent bevállalni. Az offline támogatás esetében mindig szem előtt kell tartanunk, hogy bár a böngészőben tárolt adatok a domainünkhöz kötöttek, szabadon hozzáférhetőek és módosíthatóak a felhasználó által. A böngészőben tárolt adatokat kliens által vezéreltként kell kezelni. A felhasználók (vagy az oldalon futó rosszindulatú szkriptek) ellenőrizhetik, módosíthatják vagy törölhetik azokat, ezért soha nem szabad mérvadónak tekinteni őket.  
Tehát ha olyan adatokat tárolunk, amivel módosítani szeretnénk a saját adatbázisunkat, amint visszatért a kapcsolat, akkor csak olyan területen tegyük ezt, ahol nem jelent komoly kockázatot. Azt valószínűleg eltárolhatjuk, hogy kipipált egy todo elemet a listáról, azt azonban jobb, ha nem, hogy kinek mennyit akart utalni.  

<br>

A másik szempont, amit jó szem előtt tartani, az, hogy meddig vagyunk hajlandóak növelni a komplexitást. Amikor engedünk bizonyos műveleteket, akkor le kell kezelnünk, hogy mi történik, amikor visszajön a kapcsolat, mi történik, ha hibába ütközik a késleltetett végrehajtás és milyen más folyamatokkal akadhat össze. A frontend szintjén sorba rendezett feladatok követése és megfelelő eltakarítása eredményezhet bonyolult eseteket, amelyek normál teszteléskor nem jönnek elő.

<br>

Erre kínál részleges natív megoldást a __Background Sync API__: a service worker-en keresztül regisztrálhatunk egy szinkronizációs eseményt, amit a böngésző automatikusan újrapróbál, amint helyreáll a kapcsolat, így nem nekünk kell figyelnünk az `online` eseményt és kézzel újraindítani a késleltetett műveleteket. Támogatottsága azonban egyenetlen — Safari és Firefox nem implementálja —, ezért egyelőre inkább kiegészíti, mint kiváltja a kézzel írt újrapróbálkozási logikát.