---
title: "MCP szerver"
description: "Egyre népszerűbb, hogy hozzáférést adunk AI ügynököknek különböző alkalmazásokhoz. Az MCP szerver egy nyílt szabványt (Model Context Protocol) követ, ami standardizálja a kommunikációt az AI alkalmazások és a kapcsolt alkalmazások között. Az elterjedt hasonlat szerint az MCP az AI alkalmazások USB-C portja."
date: 2026-11-09
tags: ["backend", "frontend", "security"]
---
<figure class="diagram4">
  <img src="/mcp-server-workshop.webp" srcset="/mcp-server-workshop.webp 1x, /mcp-server-workshop-2x.webp 2x" alt="Asztalosműhely analógia: a Claude és ChatGPT robotok – CIMD kártyával és ACCESS belépővel – Claude egy szekrényt kér az MCP szerver művezetőtől, a TOOLS tábla alatt a munkások gyalulnak, összeszerelnek és festenek" width="628" height="785" loading="lazy" />
  <figcaption>MCP szerver, mint manager</figcaption>
</figure>

<br>

## Mire is jó egy MCP szerver?

Aki olvasta az [előző szösszenetemet](/hu/blog/my-experiences-with-ai) az AI-os kalandjaimmal kapcsolatban vagy csak simán szoftverfejlesztő, annak valószínűleg az elsők között ugrik be, hogy az AI-támogatott fejlesztés során MCP-kkel bővítjük az ügynökök eszköztárát. Ilyenekre példa:
- Context7 - aminek segítségével az ügynökünk elolvashatja a legfrissebb dokumentációt
- Playwright - aminek segítségével böngészőben tudja ellenőrizni a frontend változtatásokat
- GitHub MCP - kapcsolódhat a távoli kódbázishoz és információkat kérhet el a pull requestekről

<br>

Lehet, hogy a nem fejlesztők közül is sokan kötöttek már össze alkalmazásokat MCP segítségével, például amikor jogot adtak egy AI asszisztensnek az e-mail-fiókjuk olvasására vagy a naptáruk módosítására. Elképzelhető, hogy rábíztak egy rendelést vagy repülőjegy-foglalást.

<br>

Az MCP nagy előnye az, hogy leegyszerűsíti az alkalmazás elérhetővé tételét, mert nem kell AI kliensenként egyedi kódot írni. Minden AI alkalmazás tud kapcsolódni, amelyik beszéli az MCP-t és van joga a kapcsolódáshoz.

<br>

## Mi történik a kapcsolódáskor?

Egy MCP kliens a protokoll által előírt formában lekéri az MCP szervertől, hogy milyen eszközökhöz, erőforrásokhoz tud hozzáférni. Ezt megelőzi egy `initialize` kérés, amiben a kliens és a szerver egyeztetik a támogatott képességeket.  
Ha a szerver HTTP-n érhető el és védett, a kliensnek mindezek előtt authorizációt kell szereznie.  
Az MCP protokoll kétféle transzportot támogat:
- __Stdio transzport__: a kliens alfolyamatként indítja el a szervert ugyanazon a gépen, és a standard bemeneten/kimeneten keresztül kommunikálnak. Hálózat és authorizációs szerver nem kell, a hitelesítő adatokat jellemzően környezeti változókból kapja a szerver.
- __Streamelhető HTTP transzport__: HTTP POST-ot használ a kliens-szerver üzenetekhez, és opcionálisan Server-Sent Events (SSE) streamet a szerver üzeneteihez.

<br>

Ez utóbbi támogatja a standard authentikációs módszereket: bearer token, API kulcs, egyedi fejlécek. Az MCP az __OAuth__-on keresztüli authentikációt javasolja és számos AI alkalmazás meg is követeli. Az OAuth lényege, hogy a felhasználó belép az alkalmazásba, amivel jogot ad a kapcsolatra, de közben a jelszavát nem osztja meg az AI klienssel.

<br>

Egy közös API kulcs azért nem szerencsés, mert ha egyetlen felhasználó visszaél a lehetőségeivel, csak úgy tudjuk korlátozni, ha lecseréljük a kulcsot. Így minden más felhasználónak kellemetlenséget okozunk, mert be kell állítaniuk az új kulcsot.

<br>

Az authentikáció mellett jobb esetben azt is ellenőrzik, hogy a kapcsolódást kérő kliens megbízható-e. Ennek ajánlott módja a CIMD (Client ID Metadata Document): a kliens azonosítója egy HTTPS URL, ami a kliens metaadatait leíró dokumentumra mutat. Az authorizációs szerver letölti ezt a dokumentumot, és ellenőrizheti, hogy a kliens az elfogadottak között van-e.

<br>

Ha az authentikáció (azonosítás) és authorizáció (jogosultság-ellenőrzés) rendben van, akkor a felhasználó szöveges kéréseit a modell eszközhívásokra fordítja, a kliens pedig végrehajtja ezeket. A válaszok alapján az AI szöveges összefoglalót küld a felhasználónak a történtekről.

<br>

## Nézzünk egy konkrét példát

A Kasszy beállításaiban van egy "Csatlakoztatott AI asszisztensek" rész. Itt útmutatást kap a felhasználó, hogyan csatlakoztathatja a Claude-ot vagy a ChatGPT-t.

<br>

Claude esetében a Kasszyt egyedi konnektorként kell hozzáadni a konnektoroknál, a frontenden megadott URL segítségével.

<br>

<figure class="diagram4">
  <img src="/add-as-claude-connector.webp" alt="A Claude prompt alatti plusz ikonra kattintva elérjük a konnektorokat. Új, egyedi konnektort kell létrehozni." width="814" height="439" loading="lazy" />
  <figcaption>Egyedi konnektor létrehozása Claude-ban</figcaption>
</figure>

<br>

Ebben az esetben a host maga a Claude alkalmazás, az MCP kliens pedig az a Claude-on belüli komponens, amely a Kasszy MCP szerverével kommunikál. A kliens elkéri az MCP szervertől, hogy mihez férhet hozzá. Ezek lehetnek __tool-ok__, __resource-ok__, __prompt-ok__. 

<br>

Claude a lehetőségeket a kontextusában tárolja. Ennek megfelelően nem szerencsés, ha egy hatalmas API minden endpointjának megfelel egy eszköz. Ilyenkor érdemes plusz réteget bevezetni, ahol csoportosíthatjuk a funkciókat.

<br>

A felhasználó elküldheti a kérést, hogy például az áfonyát "elfogyott" státuszúra kell állítani.  
A modell kiválasztja a feladathoz leginkább illő eszközt, például az "update_inventory" toolt, a kliens pedig meghívja.  
Az MCP szerver válasza JSON-RPC 2.0 formátumban érkezik. 

```json
{
  "jsonrpc": "2.0",
  "id": 42,
  "result": {
    "isError": false,
    "content": [
      {
        "type": "text",
        "text": "Blueberries have been marked as depleted."
      }
    ],
    "structuredContent": {
      "itemId": "demo-item-123",
      "name": "Blueberries",
      "status": "depleted"
    }
  }
}
```

A protokoll szerint minden kérésnek van azonosítója (`id`), és a válasz ugyanezt az azonosítót tartalmazza, így a kliens össze tudja párosítani őket.
A strukturált JSON-t az AI asszisztens visszafordítja egy könnyen érthető szövegre.

<br>

## Konklúzió

Néha hallom véleményvezérektől, hogy az AI ügynökeik használhatják a bankkártyájukat, válaszolhatnak a leveleikre, szállást foglalhatnak a nevükben. Meg persze azt is, hogy mennyire örülnek ennek. Ilyenkor elgondolkodom, hogy velem van-e a baj. Nyilván én nem szembesültem még az egymást érő külföldi utak szervezésének a terhével, így nehezen tudom elképzelni, hogy erre égessek el tokeneket. Azt még kevésbé, hogy az AI döntsön a kiadásaimról.

<br>

Nem tudom felmérni, hogy milyen arányban vannak azok, akiknek megéri mindent összekapcsolni az AI-jal. Úgy gondolom azonban, hogy a „gazdagemberproblémákon” túl is hasznos lehet konnektorral ellátni az alkalmazásokat. Bizonyos munkafolyamatokat érdemben javíthat, a nem kívánt tranzakciókhoz képest jóval kisebb kockázattal.

<br>

Az elmúlt években nagyon népszerű volt minden szoftvert AI ügynökkel kiegészíteni. Ez sok esetben azt jelenti, hogy a vállalat vagy maga fizeti a nem túl kicsi szervert, amin az LLM fut, vagy pedig szolgáltatásként fizet a modell tulajdonosának (OpenAI, Anthropic stb.). Ez nyílt végű számlákat és nehezen kalkulálható jövőbeli kiadásokat jelent, amelyeket a haszonkulcs vagy fedez, vagy nem.  
Az én projektem esetében egyértelmű volt, hogy a haszonkulcs ezt nem fedezné. Ettől még nem lehetetlen a felokosítás. Az MCP szerver implementációjával azok a felhasználók, akik rendelkeznek AI asszisztenssel, kihasználhatják annak előnyeit. Én például, bár szeretem a manuális műveleteket, egy külső forrásból származó receptet úgy viszek fel, hogy megadok Claude-nak egy linket. Ő pedig szépen kinyeri a releváns információkat, és még a forrást is megjelöli a leírásban.  
Szóval igen, összességében AI konnektor párti vagyok, ha szem előtt tartjuk a biztonságot.  

<br>

Az már más kérdés, hogy tudjuk-e edukálni a felhasználókat a konnektorok használatára, vagy csak saját AI klienssel tud működni az okosítás. Ez utóbbi esetben úgy gondolom, hogy nem minden funkció éri meg, hogy fűtsük miatta az óceánokat.
