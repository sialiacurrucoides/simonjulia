---
title: "Titkok kezelése (Secrets management)"
description: "A titokkezelők célja a titkok valóban titok maradjanak, lehetővé téve számunkra, hogy érzékeny információkat egyetlen helyen tároljunk, és különböző engedélyeket adjunk a különböző gépek és emberek számára."
date: 2026-03-26
tags: ["backend", "security", "DevOps"]
---
Egy applikációban titok minden olyan érzékeny adat, amellyel vissza lehet élni. Ilyen lehet egy API kulcs, amivel más szolgáltatóhoz kapcsolódunk, egy jelszó, amivel például az adatbázisunkat éri el a backendünk, egy titkosításhoz felhasznált token és így tovább. Ezeket sok esetben meg kell osztanunk vagy kollégák között, vagy pedig a rendszerünk különböző részei között. Minél komplexebb projektről van szó, annál valószínűbb, hogy problémássá válhat ezeknek a titkoknak a kezelése.

<br>

## Lehetséges problémák
- Tapasztalatlan fejlesztő beleír egy titkot a kódba, vagy commitolja és pusholja a kódbázisba, akár ki is logolja valahol. Onnantól bárki, aki hozzáférhet a kódbázishoz, hozzáfér ezekhez az adatokhoz is, szóval nem csak a kódbázisunk biztonságának kell tökéletesnek lennie, hanem az összes kódhoz hozzáférő gép biztonságának is.
- Kényelmi okokból a fejlesztők külső cég által üzemeltetett platformon osztják meg egymással a titkokat. Több tízezer titkot találtak egy nagy nyelvi modell tanító adathalmazába. Legtöbben tudnak olyan chat alkalmazásról, amelyik az adatainkat is eladja, de a biztonságosabbnak tekintettek is lehallgathatók.
- Nagyon sok helyen lesz jelen egy titok: különböző fejlesztői gépeken, különböző platformokon, amit __secret sprawl__-nak neveznek. Ez növeli a támadási felületet és nehézzé teszi a titkok dinamikus változtatását, amivel biztonságosabbá tehetnénk az applikációt.
- Egy szivárgás esetén nehezen visszafejthető, hogy hol történt az adatszivárgás, minek a védelmét kellene megerősíteni. Nem tudni, hogy mikor ki használta és tárolta a titkokat.  

<br>

Kisebb projekteknél elégséges lehet egy Git által ignorált .env fájlban kezelni a titkokat, linterrel és kódreview-val bevédeni, hogy ne válhassanak publikussá a titkok. Azonban minél nagyobb vagy minél érzékenyebb adatokkal dolgozó projektről van szó, annál valószínűbb, hogy érdemes megfontolni egy “titokkezelő” használatát, ami megoldást jelenthet néhány vagy az összes fenti problémára.

<br>

## Titokkezelők
Sokféle termék érhető már el, amely megoldást nyújt a titkok kezelésére. Ezek eltérnek egymástól a használatuk egyszerűségében, az árukban, az elérhető jellemzőikben, a skálázhatóságukban. Azonban a legtöbbre jellemző, hogy lehetővé teszi, hogy egyetlen, __centralizált__ helyen tároljuk a titkokat. Azokat pedig csak hitelesített és az adott titokhoz autorizációval rendelkező felhasználó érhesse el, akinek a hozzáférése bármikor visszavonható a titokkezelő adminja által. Persze felmerül a kérdés, hogy így csak a titokkezelőhöz kell hozzáférni, hogy kezünkben legyen minden érzékeny információ. Azonban a titokkezelők mindegyikénél beállítható a két faktoros hitelesítés. Ez szemben áll azzal az elvárással, hogy minden felhasználó minden eszközén maximális biztonság legyen.  

<br>

Mielőtt még rátérnék konkrét termékek felsorolására, még megjegyezném, hogy nem csak csapatok profitálhatnak egy titokkezelő használatából. Egyéni projektnél is hasznos lehet, ráadásul olyankor ingyenes opciók is elérhetőek. Velem már előfordult, hogy egy épp elkezdett hobbi projektben fontos információk egy GIT által ignorált env fájlban voltak és elromlott a gépem. Másik gépen le tudtam kérni a kódot, de kezdhettem újra a titkok újragenerálását. Természetesen nem kell minden mini projektet túltervezni, a titokkezelő hozzáadás jár némi többlet energiaráfordítással.
A továbbiakban felsorolok pár terméket, a teljesség igénye nélkül. 

<br>

### Bitwarden secrets manager
#### Leírás
Ez egy viszonylag könnyen használható, mindenki számára elérhető titokkezelő, viszont nem skálázható egy ponton túl, enterprise szinten már érdemes egy több funkcionalitással rendelkező eszközt használni.  
Működési logikája a következő: létrehozunk egy “organization”-t, amin belül létrehozunk egy projektet. A projekthez felvehetünk titkokat kulcs-érték párokként. Minden titokhoz generálódik egy azonosító, amelyet majd használhatunk a kódunkban. Minden titok esetében egyénileg megadható, hogy milyen felhasználó vagy milyen gép férhet hozzá, illetve csak olvashatja vagy írhatja is. A gép felhasználó esetében az “organization”-hoz kell rendelni gépi fiókokat. Ezekhez generálhatunk tokeneket, amelyeket az adott gépen környezeti változóként kell tárolni. Az automatizált lekérés úgy működik, hogy telepítjük a “bws” cli-t (nem kell a bw cli, ami a jelszókezelőhöz van). Ezután a cli feladata lesz, hogy a secret azonosítókat kicserélje a valós értékükre. Ennek a módszernek a hátránya, hogy még mindig érdemes egy .env fájlt megtartani, csak az értékeket a bitwarden azonosítók lesznek. Ezek azonban nem annyira érzékeny adatok.  
Amire még figyelni kell, hogy USA- és EU-régiók támogatottak, a CLI azonban jelen írás ideje alatt alapértelmezetten még mutathat az USA szerverre, hiába van EU-s felhasználónk és ott generált access token-ünk. Be kell állítanunk: `bws config server-base https://vault.bitwarden.eu`.
#### Árazás (2026-03-25)
Van ingyenes verziója: korlátlan titok, 2 felhasználó, 3 projekt, 3 gépi fiók  
Teams: 6 dollár / felhasználó / hónap - korlátlan titok, projekt, 20 gépi fiók, audit logs  
Enterprise: 12 dollár / felhasználó / hónap - 50 gépi fiók, extra enterprise funkciók  
#### Vendor lock-in
Alacsony.
#### Self-hosting
Lehetséges.

<br>

### Infisical
#### Leírás
Könnyen használható, intuitív felülete van. Külön előnye, hogy alapból támogatja, hogy egy projektnek több környezete van és onnantól, hogy kiválasztottunk egy további környezetet, táblázatosan jelöli, ha hiányzik valamilyen titok valamelyik környezetből. Itt is van US és EU szerver, figyeljünk bejelentkezéskor, hogy melyiknél regisztráltunk korábban 🙂.  
Itt nem a titkoknál kell szerkeszteni, hogy melyik fiók milyen jogokkal rendelkezik, hanem role-okat lehet definiálni, ahol megadható, hogy adott role milyen környezetekhez és milyen titkokhoz fér hozzá. Alapértelmezetten létezik az admin, a fejlesztő, a néző és a jog nélküli.  
Az integrációhoz itt is egy CLI-t kell letölteni, de itt már nincs szükség titok azonosítókra. A CLI paranccsal (pl. `infisical run --env=dev -- `) futtatva a projektet, a titkok beinjektálódnak.
#### Árazás (2026-03-26)
Van ingyenes verziója: korlátlan titok (de alacsonyabb rate limit), 5 identitás, 3 projekt, 3 környezet  
Pro: $18/month per identity - magasabb rate limit, titok verziózás, titok rotáció, 12 projekt, 12 környezet, 90 napos audit log  
Enterprise: egyedi árazás, sok enterprise funkció  
#### Vendor lock-in
Alacsony.
#### Self-hosting
Lehetséges.

<br>

### Doppler
#### Leírás
Egy modern titokkezelő, amely nagy hangsúlyt fektet az egyszerű használatra és a jó fejlesztői élményre. A felülete könnyen átlátható, és gyorsan beüzemelhető. A titkok kezelése projektekhez és környezetekhez kötött, hasonlóan az Infisicalhoz.
Külön előnye, hogy nagyon jól integrálható különböző CI/CD rendszerekkel és felhőszolgáltatókkal, valamint CLI-n keresztül egyszerűen injektálhatók a titkok futásidőben. Nem szükséges külön azonosítókat kezelni, mint például a Bitwarden esetében.
Hátránya, hogy erősen a saját ökoszisztémájára épít, és hosszabb távon nehezebb lehet leválni róla.

#### Árazás (2026-03-26)
Van ingyenes verziója: limitált számú titok és alap funkcionalitás  
Team: kb. $7–$10 / felhasználó / hónap (környezettől és funkcióktól függően)  
Enterprise: egyedi árazás, fejlettebb jogosultságkezelés és audit funkciók  

#### Vendor lock-in
Közepes. A Doppler saját workflow-jára és CLI-jére épít, így a migráció később nehezebb lehet.

#### Self-hosting
Nem lehetséges.

<br>

### HashiCorp Vault
#### Leírás
Az egyik legismertebb és legkomplexebb titokkezelő megoldás, elsősorban enterprise környezetre. Rendkívül rugalmas és sokféle use case-t lefed: statikus titkok kezelése mellett támogat dinamikus titok generálást (pl. ideiglenes adatbázis hozzáférések), titok rotációt és fejlett hozzáférés-kezelést.
A működése policy alapú, és különböző autentikációs módszereket támogat (token, Kubernetes, AWS IAM stb.).
Hátránya, hogy jelentősen bonyolultabb a beüzemelése és üzemeltetése, mint a többi itt felsorolt eszköznek. Kis projektekhez általában túlzás.
#### Árazás (2026-03-26)
Van open source (ingyenes) verzió  
Enterprise: egyedi árazás (magas költség, de sok extra funkció)  
Cloud (HCP Vault): használat függő árazás  

#### Vendor lock-in
Alacsony–közepes. Bár komplex, de nyílt szabványokra és jól dokumentált API-kra épít.

#### Self-hosting
Lehetséges (és gyakori). Ez az egyik fő előnye.

<br>

### Google Cloud Secret Manager
#### Leírás
A Google Cloud Platform natív titokkezelő szolgáltatása. Egyszerűen használható, ha már eleve GCP-t használunk. A titkok verziózhatók, auditálhatók, és szorosan integrálódnak más GCP szolgáltatásokkal (pl. Cloud Run, GKE).
A hozzáférés az IAM rendszeren keresztül szabályozható, ami nagy rugalmasságot ad, de kezdők számára bonyolult lehet.
Hátránya, hogy erősen a Google Cloud ökoszisztémához kötött.

#### Árazás (2026-03-26)
Kb. $0.06 / aktív titok / hónap  
$0.03 / 10 000 lekérés(Kis projektnél általában nagyon alacsony költség)  

#### Vendor lock-in
Magas. Erősen kötődik a GCP-hez és az IAM rendszerhez.

#### Self-hosting
Nem lehetséges.

<br>

### Amazon Web Services Secrets Manager
#### Leírás
Az AWS natív titokkezelő szolgáltatása, amely hasonló szerepet tölt be, mint a Google Cloud Secret Manager, de több beépített funkcióval rendelkezik, például automatikus titok rotációval (pl. adatbázis jelszavak esetén).
Szorosan integrálódik az AWS ökoszisztémával (IAM, Lambda, RDS stb.), és jól használható komplex, skálázott rendszerekben.
Hátránya, hogy viszonylag drága lehet, és az AWS IAM rendszer komplexitása miatt a beállítása időigényes.

#### Árazás (2026-03-26)
Kb. $0.40 / titok / hónap  
$0.05 / 10 000 lekérés(Drágább, mint a legtöbb alternatíva)  

#### Vendor lock-in
Magas. Szorosan kötődik az AWS infrastruktúrához.

#### Self-hosting
Nem lehetséges.