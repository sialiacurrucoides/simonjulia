---
title: "Content Security Policy"
description: "A Content Security Policy (CSP) segítségével megadhatjuk, hogy milyen források használatát tekintjük biztonságosnak az oldalunkon, és mi az amit tiltunk. Ezáltal számos támadási formával szemben növelhetjük a védelmünket."
date: 2026-06-25
tags: ["frontend", "DevOps", "security"]
---
<figure class="diagram3">
  <picture>
    <source media="(max-width: 600px)" srcset="/csp_hu_mobile.svg" />
    <img src="/csp_hu.svg" alt="CSP" loading="lazy" />
  </picture>
</figure>

<br>

Még egy statikus oldalt is felhasználhatnak a támadók olyan célokra, amelyek kárt okozhatnak a felhasználóknak. Ezért kell lehetőleg mindent megtennünk, hogy csökkentsük az idegen kódok futtatásából és az oldalunkkal való visszaélésekből eredő kockázatokat. Ebben segítségünkre lehet a CSP.

<br>

## Mi is pontosan a CSP?

A Content Security Policy (CSP) olyan utasítás-együttes a böngésző számára, amely meghatározza, hogy milyen forrásokat engedélyez az oldal.  
Különböző direktívákban lehet megadni, hogy mit fogadunk el a képek, a stílus, a szkriptek és egyéb források esetében. Például:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self' https://cdn.trusted.com;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

<br>

- `default-src 'self';` - ami nincs specifikálva, ezt az értéket használja
- `script-src 'self';`  - JavaScript futtatása
- `style-src 'self';`  - stílus forrása
- `img-src 'self' data:;`  - kép forrása
- `font-src 'self' https://cdn.trusted.com;`  - betűkészlet forrása
- `connect-src 'self';`  - milyen végpontok felé kezdeményezhet kapcsolatot fetch, XMLHttpRequest, WebSocket vagy EventSource segítségével
- `object-src 'none';`  - embed, object, applet tagek tartalmának forrása
- `base-uri 'self';`  - a relatív hivatkozások forrása
- `form-action 'self';` - űrlapok célpontja
- `frame-ancestors 'none';` - beágyazhatóság

<br>


Ezeket a szabályokat a __válasz fejlécben__ szoktuk megadni, ha van hozzáférésünk az oldal kiszolgáló szerveréhez. Tipikus eset az Nginx beállítások módosításával érhető el.  
Azonban megadható __meta tag__ként is, amikor statikus oldalunk van és nem mi rendelkezünk a kiszolgáló konfigurációja felett. Fontos azonban, hogy egyes direktívák (például a frame-ancestors) ebben a formában nem támogatottak.

<br>

### Hogyan ellenőrizhető, hogy egy oldal milyen CSP szabályokat használ?
1. A Network fejléc alatt az első, index oldal "Response headers" részénél tudsz rákeresni.
2. Ha nincs a header-ben, akkor a forráskód meta tagjeiben tudod megnézni, hogy van-e beállítva.

<br>

### Hash és Nonce
Ha szükségünk van inline scriptekre vagy stílusra, de el szeretnénk kerülni az idegen kódok futtatását az oldalunkon, két stratégia áll a rendelkezésünkre.
- Ha a kódrészletünk állandó, nem függ semmilyen dinamikus adattól, akkor hash-t rendelhetünk hozzá. A hash értéket a CSP-ben adjuk meg, a böngésző pedig összeveti az inline script tartalmának hashével. Hash használatakor nincs szükség külön attribútumra a script tagben. Így ezek az inline scriptek akkor is elfogadásra kerülnek, ha mások nem. Azonban egyetlen karakter változtatása után újra kell generálni a hasht. Szerencsére erre vannak automatizált megoldások, például az Astro is megteszi ezt helyettünk, ha bekapcsoljuk a csp-t a beállításaiban.
- A __nonce__ ("number used once") egy betöltésenként változó érték, amelyet a szerver generál. Ugyanazt az értéket meg kell adni a CSP fejlécben és az érintett script vagy style tag nonce attribútumában is. Akkor van rá szükség, ha egy kódrészlet nem előre definiált, hanem dinamikusan változó, például felhasználói bemenettől is függ. Ehhez a megoldáshoz szükség van szerver futtatására. Nem használható például egy statikus oldal esetén, amit egy CDN szolgál ki.

<br>

A modern CSP konfigurációk általában nonce vagy hash alapú megközelítést részesítenek előnyben, mert ezek hatékonyabban védenek az XSS támadásokkal szemben, mint a pusztán domain-alapú engedélyezési listák.

<br>

## Milyen támadások ellen hasznos?
Minden lehetséges problémát nehéz lenne tárgyalni, de lássunk néhány tipikusat.

<br>

### XSS (Cross-Site-Scripting)
Az XSS az a jelenség, amikor rosszindulatú kódot injektálnak az oldalunkba, hogy azzal hatással legyenek annak felhasználójára. Sok válfaja van ennek a támadásnak.  
#### Supply-chain compromise
Amikor valamelyik függőségünk kompromittálódik és beépül egy rosszindulatú kódrészlet a miénkbe. Hash vagy nonce alapú CSP esetén egy váratlanul módosult script nem fog megfelelni a CSP szabályainak, ezért a böngésző blokkolhatja annak futását.  
#### Markdown content injection
Egyes Markdown renderelők engedélyezik a nyers HTML használatát. Nem megfelelő szűrés esetén ez XSS sérülékenységhez vezethet.  
#### Bemenetek kompromittálása
Szöveges üzenetként egy káros kódot is elmenthet az adatbázis, ha nem történik meg a megfelelő ellenőrzés. Például egy kommentelő beküld egy káros scriptet, az oldal pedig amikor megjelenti az összes kommentet, visszaadja azt az összes többi felhasználónak. Ebben az esetben a CSP kisegítő védelem, nem jelenti azt, hogy el kellene hanyagolni a bemeneti adatok ellenőrzését.

<br>

### Clickjacking
Ez az a jelenség, amikor egy legitim oldalra egy láthatatlan keretbe rátöltenek egy másik réteget és amíg a felhasználó azt hiszi, hogy például egy lejátszás gombra kattintott, addig igazából lehet, hogy egy utalást hagyott jóvá vagy lájkolt egy bejegyzést. Ezen támadás ellen véd a __frame-ancestors__ beállítás. Ha nem akarunk egyáltalán iFrame-eket használni, akkor célszerű 'none'-ra állítani.  
A frame-ancestors direktíva nem támogatott meta tagben, ezért azt HTTP fejlécből kell küldeni. Alternatív megoldásként használható az X-Frame-Options fejléc, amit be lehet állítani egy `_headers` fájl segítségével is.

<br>

### Base-tag hijacking
Ha a támadó beállítja a base tag href attribútumát egy ellenséges oldal elérhetőségére, akkor minden relatív link az oldalunkon át fog vezetni a káros oldalra. A __base-uri__ 'self' beállítással védekezhetünk ez ellen.

<br>

### Form-action hijacking
A form tartalmának eltérítése, ha más céloldalt sikerült a támadónak beállítani.

<br>

### Data exfiltration
Adatok kinyerése az oldalunkról. A __connect-src__ megfelelő beállításával korlátozhatjuk, hogy a JavaScript milyen külső végpontokkal kommunikálhat fetch, XMLHttpRequest, WebSocket vagy EventSource segítségével.

<br>

### Legacy plugin exploits
Bár a Flash és a Java Applet ma már gyakorlatilag kihalt technológiák, az __object-src__ 'none' továbbra is jó gyakorlat, mert teljesen letiltja az ilyen beágyazható objektumokat.

<br>

## Ne felejtsük el a kivételek hozzáadását
A CSP esetében szem előtt kell tartanunk, hogy ha nem jól adtuk meg a beállításokat, akkor bizony el tudunk törni néhány funkcionalitást. Ezért érdemes először a __Content-Security-Policy-Report-Only__ beállítást használni. Ezzel letesztelhetjük a konfigurációnkat. Ez nem fog megakadályozni semmilyen inline szkriptet vagy stílust, de jelenteni fogja a szabálysértéseket a böngésző fejlesztői eszközeiben, illetve megfelelő konfiguráció esetén riportokat is küldhet róluk. Csak akkor érdemes az éles beállításra váltani, ha minden olyan jelzést kezeltünk, ami egy hasznos funkcióhoz kapcsolódik. Így például ne felejtsük el az elfogadott listára tenni a Sentry domaint, ha hiba monitorozásra használjuk vagy éppen a Google Analytics linkjeit, ha azzal az oldal forgalmát monitorozzuk.

<br>

## A HTTP beállítások erősségének ellenőrzése
A https://observatory.mozilla.org/ oldalon leellenőrizhetjük, hogy mennyire erősek a beállításaink. Sőt, azt is megnézhetjük a __Benchmark comparison__ fülön, hogy hogy állunk az átlaghoz képest. Meglepő lehet, hogy milyen sok oldal nem ér el egy magasabb szintet. Ez azonban sok tényező következménye. Ellenőrzésem során még a Google keresője sem ért el kimagasló eredményt, ami jól mutatja, hogy komplex funkcionalitás esetén a gyakorlatban nem mindig a legszigorúbb beállítás a megoldás. Egy szigorú CSP-vel kockáztatnák, hogy eltörnek bizonyos funkciókat, míg a naplózás segítségével rálátásuk van, hogy milyen próbálkozások vannak. Az eredmények természetesen idővel változhatnak.

<br>

## Konklúzió
Összességében úgy gondolom, hogy érdemes pár órát rászánni, hogy adjunk egy további védelmi réteget az oldalunknak. Arra érdemes figyelni, hogy egy már működő oldalon a szabályokat fokozatosan vezessük be, és először a Report-Only mód segítségével ellenőrizzük, hogy nem törünk-e el fontos funkcionalitásokat.