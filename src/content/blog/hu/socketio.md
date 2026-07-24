---
title: "Valós idejű értesítés küldés"
description: "A HTTP kommunikáció alapvetően kérés–válasz (request–response) modell szerint működik. A kliens csak akkor kap új adatot, ha újabb kérést küld a szervernek. Ezért egy állapotváltozás folyamatos követéséhez gyakran pollingra vagy más technikára van szükség. Erre a problémára adott megoldást a WebSocket, ami lehetővé teszi a kapcsolat hosszú ideig való fenntartását. A gyakorlatban legtöbbször a Socket.IO az, ami segítségünkre lesz, mert megoldásokat tartalmaz sok olyan problémára, amire a WebSocket önmagában nem."
date: 2026-07-24
tags: ["frontend", "backend"]
---
<figure class="diagram3">
  <picture>
    <source media="(max-width: 600px)" srcset="/socketio_hu_mobile.svg" />
    <img src="/socketio_hu.svg" alt="Adatáramlás a nyitott kapcsolaton keresztül" width="900" height="630" loading="lazy" />
  </picture>
  <figcaption>Adatáramlás a nyitott kapcsolaton keresztül</figcaption>
</figure>

<br>

## Alkalmazási területek
- üzenetküldő alkalmazások
- több szereplős online játékok
- tőzsde adatok valós idejű megjelenítése
- élő sport események
- monitorozás
- dokumentumok több szerző általi szerkesztése
- értesítések

<br>

## A WebSocket működési elve

A WebSocket egy alkalmazási rétegbeli kommunikációs protokoll, akárcsak a HTTP. Ez utóbbival szemben azonban lehetővé teszi a folyamatos kétirányú, megközelítőleg valós idejű kommunikációt kliens és szerver között.

<br>

Miért megközelítőleg valós idejű? Értelemszerűen azért, mert a kommunikációs folyamat sokszereplős (lásd az első ábrát). A vezetéken való átjutás nem elhanyagolható idején túl, például a JavaScript egyetlen fő végrehajtási szálon fut és ha van egy hosszan futó szinkron esemény, akkor hiába szól az operációs rendszer, hogy érkezett információ az egyik socket-be, annak a feldolgozása csak akkor történhet meg, ha sorra kerül az esemény hurokban. A socket a kernel szintjén jön létre, a bejövő információ ott pufferelődik és a RAM-ban van tárolva. Ennek az architektúrának köszönhető, hogy több socket is létezhet egyszerre.

<br>

A WebSocket szállítási rétegként TCP (Transmission Control Protocol) kapcsolatot használ, mivel az megőrzi a küldött információ sorrendjét szemben az amúgy gyorsabb UDP (User Datagram Protocol) kapcsolattal.  

<br>

A Node.js alapú rendszerekhez készült egy __ws__ könyvtár, amelynek a jegyzet írásának időpontjában már majdnem 200 millió letöltése van hetente. Mind a kliens, mind a szerver oldalon használható.

<br>

## Miért használjunk Socket.IO-t?

Pusztán a WebSocket könyvtár is elég, ha demonstrálni akarunk egy egyszerű chat alkalmazást, valószínűleg probléma nélkül megtehetjük. Azonban a valós felhasználás során találkozhatunk olyan megoldandó feladatokkal, amelyek kiegészítő megoldásokat igényelnek. Ilyenek például az alábbiak:
- automatikus újracsatlakozás
- fallback más megoldásra (HTTP long-polling-ra)
- eseményalapú API
- multiplexing - egy kapcsolaton belül különböző namespace-ekhez rendelni adatot
- üzenet visszaigazolás (acknowledgement) 

Természetesen mi is megírhatjuk a megoldásokat, de miért ne használnánk egy eszközt, ami válasz mindezen problémákra, amit okos emberek jó ideje finomítanak, karbantartanak, és ingyen elérhetővé tesznek. Ez pedig a JavaScript ökoszisztémában a Socket.IO.

<br>

<figure class="diagram3">
  <picture>
    <source media="(max-width: 600px)" srcset="/socketio-handshake_hu_mobile.svg" />
    <img src="/socketio-handshake_hu.svg" alt="HTTP kézfogás, majd frissítés WebSocketre, sikertelenség esetén polling" width="900" height="420" loading="lazy" />
  </picture>
  <figcaption>HTTP kézfogás → WebSocket frissítés (vagy polling, ha nem sikerül)</figcaption>
</figure>

<br>

## Névterek (Namespaces)

Szóba került, de nem tisztáztuk, hogy mik azok a 'namespace'-ek ebben a kontextusban. Elképzelhetők úgy, mint logikai végpontok. Kívülről hasonlítanak a REST útvonalakhoz (/chat, /admin), de valójában külön Socket.IO kommunikációs csatornákat jelentenek. A segítségükkel szabályozható, hogy az applikáció mely része milyen információt érjen el.
```
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
```


<br>

## Szobák (Rooms)
Ez egy szigorúan szerver szintű fogalom. A szerver eldöntheti, hogy a felhasználók milyen szobákhoz férhetnek hozzá és aszerint küldi ki az üzeneteket. Egy namespace-hez több szoba is tartozhat, egy szobához több különböző socket.
A kliens nem tudja lekérdezni, hogy milyen roomok vannak.
```
io.on("connection", (socket) => {
  socket.join("some room");
});

io.to("some room").emit("some event");
```

<br>

## Miért nem Server-Sent Events (SSE)?

Az SSE csak szerver → kliens irányú kommunikációt tesz lehetővé, míg a WebSocket teljes kétirányú kapcsolatot biztosít. Ha az alkalmazásnak csak értesítéseket kell küldenie a böngésző felé (például hírek vagy árfolyamok), akkor az SSE egyszerűbb alternatíva lehet. Ha azonban a kliensnek is folyamatosan adatot kell küldenie (chat, játék, kollaboráció), akkor a WebSocket a megfelelő választás.

<br>

## NestJS implementálás
A legtöbb tutoriál és dokumentáció a vanilla JavaScript implementációt mutatja meg, de ahhoz, hogy be tudjuk illeszteni egy NestJS projektbe, szükség van egy adapterre. Erre jelenleg használható a '@nestjs/platform-socket.io' csomag, illetve nagyobb, osztott rendszereknél a '@socket.io/redis-adapter'. A @nestjs/platform-socket.io csomag a Socket.IO integrációját biztosítja a NestJS WebSocket absztrakcióján keresztül.
Egy egyedi script és az adapter segítségével megoldhatjuk a socket kapcsolat autentikációját, és végül a beállított socket szervert adhatjuk át NestJS applikációnknak a _main.ts_ fájlban.
```
app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));
```
Érdemes már itt gondolni a CORS beállítására is: a Socket.IO kezdeti HTTP kapcsolata miatt más originről érkező klienseket explicit engedélyezni kell, különben a kapcsolat már a csatlakozás során meghiúsulhat.

<br>

## Mit tartsunk még szem előtt?

- Kliens oldalon az események kezelését ne a connect callback függvénye végezze, mert az mindig újra létrejön újracsatlakozáskor. Az események kezelését külön sorban definiáljuk (lásd a példát a hivatalos dokumentációból).
```
// BAD
socket.on("connect", () => {
  socket.on("data", () => { /* ... */ });
});

//GOOD
socket.on("connect", () => {
  // ...
});

socket.on("data", () => { /* ... */ });
```

<br>

- Döntsünk arról, hogy az átmeneti kapcsolat kiesés során a pufferben felgyűlt eseményeket le akarjuk-e kezelni a kapcsolat visszaálltakor. Például nem szerencsés, ha a több száz egér pozíció változást egyszerre fel kellene dolgoznia a kliensnek, amikor elegendő számára az utolsó információ is. Ilyenkor használatos a _volatile_.
```
io.volatile.emit("position", playerPosition);
```

<br>

- Ne felejtsük el, hogy a WebSocketen keresztül küldött információt nem érik el az offline felhasználók, így egy jól működő értesítési rendszer esetén ki kell dolgoznunk a megfelelő adattárolási és ellenőrzési stratégiát is.