---
title: "Megfigyelhetőség"
description: "A megfigyelhetőség (observability) az a képesség, hogy egy rendszer állapotáról információkat szerezzünk a rendszer által kibocsátott adatok alapján. Tágabb fogalom, mint a monitorozás, mivel azon események kezelését is lehetővé teszi, amire nem számítottunk."
date: 2026-06-12
tags: ["frontend", "backend", "DevOps"]
---
<figure class="diagram2">
  <img src="/uptime_kuma_section.webp" alt="Uptime Kuma dashboard section" loading="lazy" />
  <figcaption>Uptime Kuma panel részlet</figcaption>
</figure>

<br>

## Miért?
A monitorozás segít, hogy észrevegyük, ha valami hibás. Előre definiált kérdésekre ad választ (például: működik-e a szolgáltatás?). A megfigyelhetőség lehetővé teszi a nagyobb kontrollt, mert adatokkal rendelkezünk az útról, ami a hibához vezetett és ezáltal olyan problémákat is vizsgálhatunk, amelyekre nem készítettünk előre dashboardot vagy riasztást.  
A megfelelő jelek gyűjtésével lerövidíthető a hibakezelési idő, könnyebben tervezhető a skálázás és az új kódváltozat élesedése után gyors visszajelzést kapunk, ha valami nagyobb hibát követtünk el a változtatással.

<br>

## Megfigyelhető jelek
Három fő kategóriába szokták sorolni a jeleket: mérőszámok (metrics), logok és nyomok (traces).

<br>

### Mérőszámok (Metrics)
A mérőszámok összesített értékek, amelyek lehetnek folyamatosan növekvőek vagy időben fluktuálóak. Az adott hónapban a látogatók száma egy kumulatív érték, ami nem csökkenhet. A hívások átlagos latenciája viszont változhat annak függvényében, hogy javítottunk vagy rontottunk a hatékonyságon.  
Mérőszámok gyűjtésére alkalmas nyílt forráskódú eszköz a __Prometheus__, amely eredményei szépen vizualizálhatóak a szintén nyílt forráskódú __Grafana__ eszközben. A különböző végpontok elérhetősége és munkafolyamatok működése pedig monitorozható az __Uptime Kuma__ felületén keresztül. Mindhárom eszközt futtathatjuk saját infrastruktúrán.

<br>

### Logok
A logok részletes információt adnak a kontextusról, amellyel kapcsolatban nyomozunk. Tárolásuk így érthető módon költségesebb is a mérőszámokénál. Szerkesztésükben érdemes a gépi olvashatóságra törekedni és kulcs-érték párokat használni egyszerű szöveges üzenet helyett. A logoknak különböző szintjei vannak:
- DEBUG: A leginkább részletes, nem feltétlen érdemes éles környezetben használni, ha csak nem egy konkrét hibakeresést segít. Inkább a fejlesztés során hasznos.
- INFO: leíró jellegű, hogy milyen folyamat történt
- WARN: potenciális veszélyt jelez, de nem hiba
- ERROR: figyelmet igényel, mert valami hibásan működött
- FATAL: szolgáltatás leállását jelzi 

Egy népszerű választás a logok követésére a __Loki__ eszköz. Nagyobb rendszerekben gyakori az __Elasticsearch és Kibana__ párosa is.

<br>

### Nyomok (Traces)
Az osztott rendszerek főszereplői. Olyan azonosítót társítunk egy kéréshez vagy üzleti folyamathoz, amely a különböző szolgáltatásokon keresztül végigkövethető, így kideríthetjük, hogy hol történt a hiba.  
Ilyen nyomok beillesztését segíti például a __Jaeger__ vagy a __Tempo__.
Kisebb applikációknál, monolith backend esetében nem feltétlen indokolt. A felállítása és fenntartása költségesebb lehet, mint a haszna. Viszont "az indulásból egy tucat mikroszolgáltatás" világában hasznos lehet tudni róla. 🙂

<br>

## SLI, SLO, SLA
### SLI (Service Level Indicator) - Szolgáltatási szintű mutató
Ide sorolható az elérhetőség, a latencia, a helyesség. Minden olyan mérőszám, amely a felhasználó tapasztalatáról árulkodhat.

<br>

### SLO (Service Level Objectives) - Szolgáltatási szintű célok
Hogy milyen célértéket határozunk meg a különböző SLI-k esetében, amiért hajlandóak vagyunk erőfeszítéseket tenni. Minél magasabb egy érték, annál jobb architektúrára és megfigyelésre van szükség. Például a 99.9%-os elérhetőség azt jelenti, hogy nem engedjük meg magunknak, hogy a szolgáltatás összesítve 43.2 percnél tovább ne legyen elérhető egy hónapban.

<br>

### SLA (Service Level Agreement) - Szolgáltatási szintű megállapodás
Ez azokat az értékeket jelenti, amelyeket vállaltunk a felhasználó felé és ha nem érjük el őket, annak jogi vagy anyagi következményei lehetnek. Ebből kifolyólag célszerű ezeket az értékeket alacsonyabbnak választani, mint a nekik megfelelő SLO-t. 

<br>

## Sentry
Ha ellenőrzésről van szó, akkor sokaknak eszébe juthat a Sentry. Ez egy fizetős szolgáltatás, de rendelkezik ingyenes csomaggal is, amely kisebb projektek számára gyakran elegendő. A Sentry elsősorban hibamonitorozásra van optimalizálva, de egyre több funkciót kap, ami megfigyelhetőséggel kapcsolatos. Integrálni is könnyű, mert nagyon sokféle applikáció típust támogat, amit kiválasztva pár lépéssel beilleszthetjük a kódunkba.  
Apróságok, amire figyelni kell:
- A DSN környezeti változóként való kezelése
- Source map beállítás olyan kód esetében, ami nem könnyen olvasható (build és minifikálás eredményeként). Ebben az esetben szintén titokként kezeljük az AUTH tokent, amit egyszerű felállás esetében egy `.sentryclirc` fájlba generál. Bonyolultabb kódbázis esetében nem annyira hagyatkozhatunk a cli eszközére, de érdemes egy kis időt rászánni a bekapcsolásra. A source map beállításnak köszönhetően a Sentry azonosítani tudja a kódrészletet, ami a hibát dobta.
- Ha van saját `global-exception-filter`-ünk, akkor illesszük be oda. (NestJS esetében: @SentryExceptionCaptured() a catch függvényhívás fölött)
- Az alap inicializálás már minden hibát automatikusan kezel. Ha további információt szeretnénk küldeni, akkor kell csak manuálisan meghívni a kódban.

<br>

A Sentry-vel azonban sok infra mérőszámot nem tudunk monitorozni, illetve egy bonyolultabb szolgáltatásrendszer esetében is kevés vagy éppen költséges lehet.

<br>

## Kisebb Projektek
Kisebb projekteknél elég lehet a Sentry. Kicsit nagyobb, üzletileg fontos projektek esetében, érdemes lehet bevezetni az Uptime Kumát, Prometheust és Grafanát.

<br>

## Nagyobb projektek
Nagyobb projektek esetében (> 10 szolgáltatás), ahol sok szolgáltatáson keresztül halad a kérés, egy komolyabb nyomkövetés indokolt lehet. Számos eszköz közül lehet választani, hogy miben szeretnénk követni a kérés útját. Azonban ahhoz, hogy a megfigyelésre használt eszközök között könnyen lehessen váltani, érdemes az OpenTelemetry-re támaszkodni.

<br>

### OpenTelemetry
Az OpenTelemetry egy nyílt szabvány és eszközkészlet, amely egységes módot biztosít metrikák, logok és trace-ek gyűjtésére és továbbítására különböző megfigyelhetőségi rendszerek felé (Prometheus, Grafana, DataDog, New Relic).  
Az OpenTelemetry egyik legnagyobb előnye, hogy lehetővé teszi a logok, metrikák és trace-ek összekapcsolását, így egy hibát több nézőpontból is könnyebben vizsgálhatunk.

<br>

## Következtetések
Plusz eszközök beüzemeltetése időigényes és a működési költséget is növeli. A jól megválasztott eszközök azonban olyan segítséget jelentenek hosszabb távon, amelyek időt és idegsejteket takarítanak meg. 🙂