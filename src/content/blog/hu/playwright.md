---
title: "Playwright"
description: "Playwright egy nyílt forráskódú eszköz alkalmazások végponttól végpontig (E2E) történő teszteléséhez."
date: 2026-06-04
tags: ["frontend"]
---
## Miért érdemes a Playwrightot használni?

Teszteket többek között azért írunk, hogy növeljük a biztonságérzetünket, amikor változtatásokat eszközlünk egy nagyobb kódbázisban. Amennyiben minden fontos funkciót lefedtünk tesztekkel, nyugodtabb szívvel adhatunk ki új módosításokat.  
Míg a `unit` tesztek egy izolált logikát tesztelnek, a végponttól végpontig (E2E - end-to-end) tesztek teljes folyamatok tesztelésére alkalmasak, szimulálva egy életszerű alkalmazáshasználatot. Vizsgáljuk, hogy mely eseményre milyen változásnak kell bekövetkeznie, és a felhasználónak mit kell pontosan látnia a képernyőn.  
E2E tesztelésre az egyik legismertebb eszköz talán a Cypress, viszont lokális használaton kívül már költségekkel járhat. Az E2E tesztek tipikusan hosszabb időt igényelnek, minthogy _pre-push_ hook-okban futtassuk őket. A hatékony munkavégzéshez a legjobb, ha a CI-ban futnak. Erre tökéletes a Playwright, mert ingyenes és mert már inicializáláskor felajánlja a megfelelő GitHub Action létrehozását.
A Playwright elsősorban böngészős tesztelésre szolgáló _test runner_, de lehetőséget ad API tesztelésére is a beépített `request` fixture-rel. A projektbe való integrálása a hivatalos dokumentációt követve kifejezetten egyszerű.

<br>

### Miért érdemes megtanulni a használatát?
Az AI korában hatalmas a kísértés, hogy a tesztírást is teljesen kiszervezzük. Részfeladatok kiszervezésével és optimalizálással nincs is gond, de ha mindent kiszervezünk, pont azt a biztonságérzetet veszíthetjük el, amiért a teszteket írjuk. Az AI ugyanis hajlamos azon funkciókra teszteket írni, amelyek le vannak fedve. Azonban ha vesszük a fáradtságot, hogy néhány tesztet lépésről lépésre magunk építsünk fel, sok olyan részletet fedezhetünk fel, amelyet érdemes javítani vagy optimalizálni. Nem gondolom, hogy cél lenne fejben tartani minden szintaxist, inkább az, hogy értsük az alap működést, ismerjük az alap funkciókat.

<br>

## Selectorok és Locatorok
A selectorok olyan szöveges elemek, amelyek rámutatnak, hogy hogyan érhető el egy DOM elem (pl: form.login-form button[type="submit"]). A locatorok ezzel szemben olyan Playwright objektumok, amelyek konkrétan képesek elemeket megtalálni és keresni. Ehhez használhatnak selectorokat, például:
```
const submitButton = page.locator(
  'form.login-form button[type="submit"]'
);
```
Azonban vannak speciális locatorok, amelyek bár a háttérben lefordítják a kérést selectorokra, a felhasználó felé egy egyszerűbb függvényt prezentálnak. Például:
```
page.getByRole('button', { name: 'Mentés' })
page.getByText('Mentés')
page.getByLabel('Email')
page.getByPlaceholder('Keresés')
page.getByTestId('save-button')
```
Ezen locatorok komplexebb feladatokat is el tudnak látni, például a _getByRole_ figyelembe veszi az accessibility role-t is és az elérhető nevet is.

<br>

A tulajdonképpeni tesztelést a már ismerős _expect_ függvénnyel végezzük, ami a Jestből ismert assertion szintaxist használja, valamint számos Playwright-specifikus ellenőrzést is tartalmaz. Leggyakrabban egy Playwright locator objektumot vár (de lehet ezen felül Page vagy APIResponse is). Egy teszt példa:
```
const saveButton = page.getByRole('button', { name: 'Mentés' });
await expect(saveButton).toBeVisible();
```
Mint láthatjuk, az _await_ kulcs utal a tesztek aszinkron természetére, nevezetesen, hogy várakoznak az adott elem megjelenésére, így rugalmas vizsgálatot tesznek lehetővé.

<br>

## Playwright VSCode plugin (1.1.19 verzió)
A széles felhasználói bázisának köszönhetően számos VSCode plugint írtak már hozzá. Az egyik legnépszerűbb, amit tudok is ajánlani, az a Microsoft által karbantartott __Playwright Test for VSCode__. Ha telepítettük, akkor megjelenik a bal oldalsó sávban egy lombik ikon. Ha arra kattintunk, akkor láthatjuk a tesztjeinket. Ha nem látjuk az összeset, mindenképp görgessünk le a __PROJECTS__ szekcióig és jelöljük ki az installált böngészőket.  
Ezután meg kell jelenjen minden tesztünk, mellette kis akció gombokkal, hogy innen is indítani tudjuk a tesztek futtatását.

<br>

A PROJECTS szekció fölött találjuk a __TOOLS__ menüt, ami izgalmas eszközöket tartogat. A _Pick locator_ elindít egy teszt böngészőt, ahol az egeret az elemek fölé navigálva megmutatja, hogy milyen locator segítségével érhető el. Az azonban könnyen előfordulhat, hogy egy üres oldalt nyit meg. Ekkor csak annyi a dolgunk, hogy bemásoljuk a lokálisan futó app url-jét ebbe a teszt böngészőbe.  
A másik szintén izgalmas funkció a _Record new_, ami szintén egy böngészőt nyit meg és elindít egy felvételt, amely során, ahova kattintunk, az azokhoz való kijelöléseket beleírja egy teszt fájlba. Nekünk kell kiegészíteni, hogy mi mindre van elvárásunk, de a releváns elemek locatorai már készen várnak.

<br>

## Hitelesítést igénylő alkalmazások tesztelése
Természetesen könnyű dolgunk van, amikor egy regisztráció nélkül elérhető oldalt tesztelünk. Azonban jellemzően olyan applikációk igénylik az alapos ellenőrzést, amelyekhez belépésre van szükség. Ezzel kapcsolatban szem előtt kell tartanunk, hogy minden különálló teszt egymástól függetlenül fut. Tehát minimum egy _beforeEach_-be kell tennünk a bejelentkezést, ha egy védett oldalt tesztelünk. Azonban ennek ismétlése minden tesztnél, ráadásul a login oldalt használva, időigényes és szükségtelen. A Playwright lehetőséget ad a böngésző állapotának (cookie-k, local storage stb.) elmentésére és újrafelhasználására. Ilyenkor beállíthatjuk, hogy a bejelentkezés automatikusan megtörténjen minden teszt futtatása előtt. Így csak akkor van dolgunk, amikor olyan oldalt akarunk tesztelni, ami még a bejelentkezés előtt van. Ilyenkor egy sor kóddal üres storage state-et állítunk be. Például:
```
test.use({ storageState: { cookies: [], origins: [] } })
```
A globális bejelentkezést egy egyedi segítő fájl segítségével tudjuk megtenni, amire hivatkoznunk kell a _playwright.config.ts_ fájlban, ami a projekt gyökér mappájában kell legyen.
```
...
  projects: [
    /* Creates + verifies + logs in a fresh test user; teardown deletes it afterwards. */
    { name: 'setup-user', testMatch: /.*\.setup-user\.ts/, teardown: 'cleanup-user' },
    { name: 'cleanup-user', testMatch: /global\.teardown\.ts/ },
    ...
  ]

```
Más leírásban a `globalSetup: require.resolve('./utils/global-setup')` szerepel. Az itt bemutatott hitelesítési megoldások példaként szolgálnak. A Playwright többféle auth-stratégiát támogat, ezért a pontos megvalósítás projektenként eltérhet.  

<br>

Megintcsak, lokálisan egyszerű dolgunk van, de mi ugye a CI-ban is szeretnénk futtatni a teszteket. Mivel adott esetben egy külső backendet használunk, akkor érdemes a CI-ban a staging applikációt tesztelni, ami a staging backendet hívja. Ehhez azonban backend változtatásokra is szükség lehet, hiszen az email verifikációt a teszt nem feltétlen tudja elvégezni. Erre írhatunk egy teszt specifikus végpontot, ami nem érhető el a production applikációban és amely egy biztonsági header beállítást is tartalmaz, hogy a staging is védve legyen. Ez az endpoint hitelesítheti a teszt emailt, ha a megfelelő titokkal érkezik a kérés. Egy másik végpont is szükséges lehet, aminek segítségével törölhető a felhasználó a teszt végeztével. Éles működésnél sok esetben csak archiválás történik, de teszt adatokkal nem érdemes folyamatosan növelni az adatbázist.  
Frontend oldalról is szükséges néhány beállítás. Meg kell adnunk a domaint, amit tesztelni akarunk. Ehhez beállítunk egy __baseURL__-t a _playwright.config.ts_ fájl _use_ pontjánál. Ugyanitt beállítunk a _extraHTTPHeaders_-t a környezeti változókból nyert titkunkkal.  
Bizonyos architektúrák esetén (például külön domainen futó frontend és backend mellett) további proxy vagy auth-megoldásokra lehet szükség a cookie-kezelés és a biztonsági beállítások miatt.
Ez a leírás szándékosan nem egy copy-paste útmutató, mert a szintaxis és az egyedi feltételek is változhatnak. Így csak a fő logikát mutattam be.

<br>

## Konklúzió

A Playwright széles körben használt, jelentős ökoszisztémával rendelkező, ráadásul ingyenes eszköz. Így nagy valószínűséggel minden kérdésünkre találunk választ, példát (a Udemy-n ajánlom Dilpreet Johal kurzusát - nincs vele semmilyen kapcsolatom, csak érthetően magyaráz).  
Továbbá az AI is jelentős tudásbázissal rendelkezik az eszközről. Egyre népszerűbb a Playwright MCP is, amely segítségével a böngészőt is használni tudja.  
Bevallom, hogy egy fokkal kevésbé volt intuitív elkezdeni használni, mint amire a Cypress esetében emlékeztem, de nagyon könnyen lehet oktatóanyagot találni hozzá és a funkciói széleskörűek, beszédes elnevezésűek.
Bár még most kezdtem el használni, tervezem, hogy a jövőben is támaszkodom majd rá.