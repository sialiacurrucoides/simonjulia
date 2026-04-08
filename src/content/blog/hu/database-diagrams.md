---
title: "Adatbázis diagramok"
description: "Az adatbázis megtervezése még az egészen kis projektek esetében is kifejezetten hasznos. Az ERD (Entity Relationship Diagrams) készítő eszközök lehetővé teszik, hogy vizuálisan egy térben át tudjuk tekinteni a táblázatainkat és azok kapcsolatait. Komplexebb programok pedig dokumentációt vagy akár SQL kódot is generálnak belőle."
date: 2026-04-08
tags: ["backend", "db"]
---
<figure class="diagram">
  <img src="/diagramDBS.webp" alt="Entity relationship diagram példa a DBSchema applikációból" loading="lazy"/>
  <figcaption>Entitáskapcsolati diagram példa a DBSchema applikációból</figcaption>
</figure>

<br>

Előnyös lehet, ha egyszerre láthatjuk a kapcsolódó táblák felépítését, mielőtt még megírnánk a sémákat és legenerálnánk az első táblázatokat. Az adatokat összefüggéseiben látva könnyebb átgondolni, hogy kimaradt-e egy mező vagy több táblára érdemes-e bontani egy-egy adathalmazt.  
Az ERD-k segítenek a megszorítások (constraint-ek), például egyedi kulcsok és idegen kulcsok tudatos megtervezésében is.  
Amikor nem egy konkrét funkcióra, hanem az adatok szerkezetére fókuszálunk, akkor könnyebb szem előtt tartani a korábban tanult jó gyakorlatokat. Az ERD-k készítése során könnyebb alkalmazni az adatbázis-tervezési alapelveket, például a normalizálást, amely segít elkerülni az adatredundanciát és az inkonzisztenciát.  
A diagramok különösen hasznosak a kapcsolattípusok (1–1, 1–N, N–N) átlátásában, ami kulcsfontosságú a helyes adatmodell kialakításához.  
A tervezési fázisban már érdemes gondolni az indexelésre is, mivel ez később jelentősen befolyásolja az adatbázis teljesítményét.
A modern eszközök abban is segítenek, hogy adatbázis-specifikusan ajánlanak típusokat, beállításokat. Egyesek AI segítségével javaslatokat is adhatnak, elvégezhetnek egy csoportosítást.

<br>

Nagyon sokféle eszköz érhető már el, amelyek különböznek komplexitásukban, funkcionalitásukban, árukban. A legtöbbnek van ingyenes verziója, de nagyon sokszor komoly korlátokkal (15 nap trial, max 10 diagram). Az adott helyzethez érdemes igazítani a választást. Lássunk néhány ilyen eszközt csoportosítva.

<br>

## Tervezés és modellezés
- Diagrams.net/Draw.io - teljesen ingyenes, böngészőből elérhető, alap funkcionalitást kínál
- QuickDBD
- ERDPlus
- Eraser
- ChartDB,
- dbdiagram.io
## Adatbáziskezelő beépített tervezővel
- DBeaver - átlátható, van ingyenes, community verzió
- DBSchema - kényelmes és sok segéd funkció van, amivel nagyon gyorsan és pontosan lehet tervezni, de csak 15 napig ingyenes
- Beekeeper Studio
- MySQL Workbench
## Dokumentációs és modellező eszközök
- dbdoc - inkább csak dokumentáció
- Vertabelo - profi modellező
- Lucidchart - profi modellező

<br>
Népszerű eszköz a draw.io, mivel ingyenes és könnyen integrálható dokumentációt szolgáló szoftverekbe (pl. Confluence). Előre definiált formákat kínál, amelyek folyamatábrák gyors elkészítését segítik. Adatbázis specifikusak a "Entity Relation" elemek, amelyek ERD építésére használhatóak. Gyorsan lehet velük dolgozni, de nem tartalmaznak adatbázis specifikus segítséget és nem is lehet a végeredményt SQL-ként exportálni. Szintén hátrány lehet néhány esetben, hogy online eszközről van szó. Így kisebb a kontroll az adatbiztonság fölött, mint egy letölthető, offline eszköz esetében.  
<figure class="diagram2">
  <img src="/diagram2.webp" alt="Entity relationship diagram példa az app.diagrams.net-ről (Draw.io)" loading="lazy" />
  <figcaption>Entitáskapcsolati diagram példa a app.diagrams.net-ről (korábban Draw.io)</figcaption>
</figure>

<br>

Egy komplex eszközben változatos funkciókkal találkozunk. A DBSchema-ban például egy tábla létrehozásakor kapunk egy előkészített GUI-t. Egy hozzáadás gombbal oszlopokat rendelhetünk a táblához, ahol megadhatjuk a néven kívül a fő tulajdonságokat, mint pl. NOT NULL, default érték vagy GENERATED ALWAYS  AS IDENTITY jelölés. Ha adatbázis specifikus projektet indítottunk, akkor a választott eszköz által támogatott típusok közül választhatunk egy legördülő menüből. Létrehozhatunk egyedi típusokat, például enumokat. Drag-and-drop segítségével összeköthetjük az elsődleges kulcsot az idegen kulccsal és automatikusan létrejön a lehetséges kapcsolat (1-N, 0-N...).  
Amikor elmozgatjuk a táblázat diagramját, akkor ezek a kapcsolatok automatikusan hozzáigazodnak a változáshoz.  
Színeket rendelhetünk a fejlécekhez, ezzel átláthatóbbá téve a funkcionálisan jobban kapcsolódó csoportokat. A táblázat varázslóban egy külön fülön indexeket határozhatunk meg.  
Amikor pedig végeztünk, akkor kiexportálhatjuk az eredményt, mint dokumentáció vagy mint SQL kód. Van lehetőség verziózásra (git-en keresztül), valós adatbázissal való szinkronizálásra.  
Bár könnyen tanulható felület, van néhány furcsasága, amit meg kell szokni. Például, aki Figmát szokott használni, annak furcsa lehet, hogy csak új elem hozzáadásával lehet bővíteni a teret. Nem görgethetünk ki egy üres területre. Ugyancsak furcsa volt számomra, hogy új adattípus létrehozása után kiugrik a típusok nézetből és vissza kell térni, hogy beállítsuk a tulajdonságait.

<br>

Kombináltan is használhatjuk ezeket az eszközöket. Például az első tervet elkészítjük egy sok funkciós programban (pl. DBSchema) amíg tart az próbaidőszak. Kiexportáljuk dokumentációként (pdf/markdown/dbs) illetve SQL-ként, ami vonalvezető (nem copy-paste) lehet a backend sémáinkhoz. Ha azok elkészültek és létrehoztuk a táblázatainkat, akkor egy másik, teljesen ingyenes programban (pl. DBeaver Community Editionben) meg tudjuk nézni mindig a legfrissebb változatát az összképnek.  
Konkrét példaként a DBeaver Community edition-ben én a következő megoldást találtam (26.0.2): jobb kattintás a public mappán -> View Schema -> Diagram fül. Verziónként eltérő lehet, hogy érhető el.  
A DBSchemában (10.1.3) az SQL exportálás a Schema menüpont alatt a Export Schema & Data-ból érhető el.

<br>
Végszóként azt tudnám mondani, hogy amikor egy 8-10 oldalas dokumentációból pár óra alatt lesz egy átfogó ábra, az egészen jó érzés tud lenni. 🙂

