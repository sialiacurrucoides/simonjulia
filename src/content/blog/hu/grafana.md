---
title: "Monitorozás Grafana segítségével"
description: "Ideális esetben hamarabb szeretnénk értesülni egy esetleges összeomlásról vagy lassulásról, mint ahogy a felhasználói panaszok megérkeznének. A Grafana segítségével megjeleníthetjük a különböző forrásból gyűjtött adatainkat és a kritikus változásokra értesítéseket állíthatunk be."
date: 2026-08-08
tags: ["backend", "DevOps"]
---

<figure class="diagram3 grafanaDiagram">
  <picture>
    <source media="(max-width: 600px)" srcset="/grafana_dashboard_mobile.webp" />
    <img src="/grafana_dashboard.webp" alt="Grafana panelek" width="900" height="339" loading="lazy" />
  </picture>
  <figcaption>Grafana panelek</figcaption>
</figure>

<br>

## Milyen szoftver is a Grafana?

Egy nyílt forráskódú szoftver adatok vizualizációjára, amit futtathatunk saját infrastruktúrán. Létezik Cloud változata, amelyet egy szolgáltató tart karban és értelemszerűen egy bizonyos adatmennyiség fölött fizetni kell érte.

<br>

A Grafana elsősorban az adatforrásokból lekérdezett adatokat jeleníti meg, és a megjelenítéshez, illetve a működéséhez szükséges konfigurációkat tárolja. Az adatokat szolgáltathatja a Prometheus (szintén nyílt forráskódú szoftver), az Amazon CloudWatch, egy SQL szerver stb.  
Grafana önmagában nem monitoring rendszer. Egy vizualizációs és observability felület, amely különböző adatforrásokhoz kapcsolódik.

<br>

## Használata

A különböző verziók eltérő felülettel rendelkeznek, most a v12.4.8-as változat elrendezését fogom követni.
Első bejelentkezés után mindenképp érdemes megváltoztatni a jelszót, az alapértelmezett adminisztrátori hitelesítő adatok miatt.  

<br>

Először meg kell adnunk egy adatforrást. Ezt a __Connections__ > __Add new connection__ menüpont alatt tehetjük. Például kiválasztjuk a Prometheust, ha az gyűjti az adatainkat.

<br>

### Dashboard létrehozása

A Dashboards menüpont alatt tudunk elindulni, a jobb felső sarokban találjuk a New gombot, amit lenyitva a __New dashboard__ menüpontra kattintva jutunk el arra a felületre, ahol vagy beimportálunk egy előre elkészített (pl. kódbázisunkban verziózott) json fájlt, vagy pedig létrehozzuk az első vizualizációt.  

<br>

Mielőtt elköteleződünk egy megjelenítés mellett, az __Explore__ oldalon ki tudjuk próbálni az adott mérőszámot. Ehhez a __metric browser__ mezőbe kell bemásolnunk a mért pl. Prometheus változó nevét vagy egy teljes képletet több változóval. Pl:
```
(1 - node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes) * 100
```
Ezután a __Run query__ gombra kattintva futtathatjuk a kérést és kapunk egy vizualizációt.

<br>

### Panel létrehozása

Ha elégedettek vagyunk a képletünkkel, akkor a Dashboardunkon az __Edit__ gombra kattintva előhívhatjuk az __Add__ legördülő menüt, ahol megtaláljuk a __Visualization__ gombot. Ekkor megjelenik a tervező felület. Itt is a __metric browser__nél kell megadnunk a képletet, alatta pedig beállíthatjuk a címkét, a formátumot, a típust. Jobb oldalon ki tudjuk választani, hogy milyen vizualizációra van szükségünk: hisztogramra, táblázatra, egyetlen számra és így tovább. Ha ez megvan, a back gombra kattintva eljutunk az alap beállításokhoz, ahol megadható a panel címe, lejjebb görgetve a mértékegység (unit), a minimum érték, a maximum.  
Ha mindent beállítottunk, akkor ne felejtsük el elmenteni az eredményt a jobb felső sarokban lévő mentés gombbal.

<br>

### Értesítés beállítása

Az __Alerting__ menü alatt a __Contact points__ oldalon tudjuk beállítani, hogy milyen szolgáltatón keresztül akarunk értesítést kapni. A beállított szolgáltatást majd ki tudjuk választani a __Notification policies__ alatt, ahol beállítható, hogy milyen időzítéssel kérjük az értesítéseket, abban az esetben, ha sérül egy szabály.  
A szabályokat az __Alert rules__ oldalon adhatjuk meg. 

<br>

Mind a szabályok, mind a panelek esetében a végeredményt exportálhatjuk, hogy később könnyebben újra fel lehessen használni őket.

<br>

## Milyen felhasználási lehetőségek vannak?

Az adatok gyűjtésének, tárolásának, kezelésének van némi költségvonzata, így bármennyire is szeretjük a színes ábrákat, többnyire van egy jól megfogalmazott cél, hogy miért monitorozzuk őket.

<br>

### Kapacitás monitorozás

Még ha hatalmas felhasználóbázisban is reménykedik valaki, az alkalmazás ötlet validálási fázisában, amikor csak néhány felhasználóval kell számolni és jelentős az esély, hogy az első változat nem életképes, masszív pénzkidobás olyan infrastruktúrát üzemeltetni, ami fel van készülve a millió felhasználóra. Tipikusan egy egyszerűbb architektúriával indulunk és egy kisebb infrával. Azonban, hogy elkerüljük a kellemetlen meglepetést, amikor a növekvő felhasználóbázis megterheli a rendszert, érdemes monitoroznunk az infrastruktúránk kapacitását. Értesítést kérünk, amikor a memória felhasználás elér egy limitet és időszerűvé válik skáláznunk a rendszert.

<br>

A szerver rendszerállapotáról a Prometheus önmagában nem tud közvetlenül információt szerezni, ezért szükség van egy külön exporterre. Ilyen a go alapú __Node-exporter__. Ez egy állapot nélküli exporter, amely a Linux rendszer és annak különböző komponenseinek metrikáit Prometheus által lekérdezhető formában teszi elérhetővé HTTP-n keresztül. A Prometheus szabályos időközönként _pull_ kéréseket küld az exporternek, amely válaszában visszaadja az aktuális metrikákat. Bár újabb verziókban különböző hitelesítési lehetőségek is rendelkezésre állnak, a portját nem érdemes közvetlenül a külvilág felé megnyitni, ha nincs rá szükség. Ugyancsak érdemes mindig elvégezni a biztonsági frissítéseket, mert egy rosszindulatú kód tálcán kínálja az információt, hogy mikor a leginkább sebezhető a rendszerünk. A Prometheus-ra ugyanez igaz, az még történeti adatokat is tartalmaz a csúcs időszakokról.

<br>

Példák kapacitás mérőszámokra:
#### RAM headroom
Egy egyenest illesztünk az elmúlt 6 óra memória igényére és kivetítjük, hogy mi fog történni 24 órával később. Ha az érték közelít a nullához, akkor egy napra vagyunk a memórialimitünktől. Ez természetesen csak egyszerű becslés: ha a memóriahasználat nem közel lineárisan növekszik, az előrejelzés könnyen félrevezető lehet. Exponenciális növekedés esetében nem elegendő jel.
#### SWAP used
A swap egy háttértáron fenntartott terület, amelyet az operációs rendszer virtuális memória részeként használhat. Ezt többnyire nekünk kell inicializálnunk a szerverünkön. A jelentős vagy folyamatos swap használat utalhat memóriahiányra vagy memória-nyomásra, de önmagában a swap használata még nem jelenti azt, hogy kevés a RAM. Egy élesítés (deploy) simán megemelheti, de az nem jelenti még, hogy a normál használat során is kevés a RAM. A magasabb érték és a többi mutatóval való együttes értelmezés segít. Ha nem magas az érték és a memória mutatók mind visszaállnak deploy után, akkor még nincs teendőnk.
#### Load average
Átlagos terhelés, olyan folyamatokat átlagol, amelyek futnak vagy várakoznak, hogy futhassanak. Linux esetében a blokkolt írások is idetartoznak, így ez a mutató akkor is lehet magas, amikor a CPU épp nem pörög.
#### Memory pressure (PSI)
A Linux úgymond fájdalomreceptora: azt méri, hogy egy adott időintervallumban mennyi időt töltöttek a folyamatok memóriaerőforrásra várva. Arányt számolva megkaphatjuk, hogy mennyi időt veszítünk. Míg a __Free RAM__ megmondja, hogy mennyi a szabad kapacitás, ez a mutató megmondja, hogy az a szint problémás-e.

<br>

### Cache tervezése

Cache réteget akkor építünk, amikor javítani akarunk a teljesítményen azáltal, hogy memóriából (RAM-ból) szolgáljuk ki a gyakran olvasott kéréseket. A RAM természetesen korlátozott erőforrás, a cache invalidációs logika pedig nem elhanyagolható forrása a fájdalmas hibáknak. Így jobb, ha nem hasraütésszerűen választjuk ki, hogy mi kerüljön a cache-be. Ehhez, még mielőtt a lassulás bekövetkezne, monitorozhatjuk a lehetséges végpontok forgalmát, és megbecsülhetjük, hogy egy adott elévülési idő (TTL) mellett milyen cache hit rate-et érhetnénk el.


<br>

### Az élesítés (deploy) hatásának monitorozása

Minden lokális teszt ellenére, egy nagyobb felhasználóbázis esetén nehéz megjósolni, hogy egy frissen élesített változtatás milyen hatással lehet az infrastruktúránkra. Ezért egy valid stratégia, hogy élesítéskor figyeljük a rendszer mutatóit, hogy ha ki is lengnek, visszaállnak-e a korábbi értékekre. Történik-e tartós változás a kérések latenciájában, illetve a CPU- és RAM-igénybevételben.

<br>

### Üzletileg fontos mutatók nyomon követése

A backend folyamatok különböző releváns lépéseinél végezhetünk egy belső mérést, amihez semmi köze külső szolgáltatóknak. Ezeket az értékeket ugyanúgy nyomon követhetjük a Grafana felületén, mint a rendszer egészségi mutatóit. Például: összes eladás, visszatérítések száma, eladások összértéke, visszatérítések aránya, konverziós ráta, legkedveltebb fizetési módszer, abbahagyott fizetés, kosárérték, regisztrációk száma és így tovább.

<br>

## Konklúzió
Van amikor igaz, hogy azt tudjuk igazán kontrollálni, amit mérünk. Ez természetesen nem azt jelenti, hogy ha vannak számaink, akkor nincs szükség domain tudásra, szakmai intuícióra, emberségre. Viszont amikor számok sincsenek, akkor többé-kevésbé vakon repülünk és nagyobb az esély a kudarcra. A Grafana egy népszerű felület az adatok monitorozására, de természetesen nem az egyetlen. Lényeg, hogy keressük meg az eszközöket ahhoz, hogy kézben tudjuk tartani az irányítást.
