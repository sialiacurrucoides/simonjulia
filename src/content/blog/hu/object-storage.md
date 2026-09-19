---
title: "Object storage"
description: "Adatbázis-másolatok mentése, médiafájlok kiszolgálása, nagy mennyiségű tanító adat tárolása. Példák, amikor érdemes megfontolni egy object storage bekötését."
date: 2026-09-19
tags: ["backend", "db"]
---

<figure class="diagram4">
  <img src="/object_storage_cloakroom_628.webp" alt="Object storage, ruhatár analógia" width="628" height="471" loading="lazy" />
  <figcaption>Objektumok egy lapos névtérben, egyedi kulcsokkal azonosítva.</figcaption>
</figure>

<br>

Ha biztosítani akarjuk, hogy adatbázisunkat vissza tudjuk állítani egy esetleges szerver meghibásodása után, akkor egy független helyen kell tárolnunk másolatokat. Rendszeresen át kell töltenünk oda a legfrissebb változatot. Kezelnünk kell azt, hogy mely másolatokat meddig tároljuk. Mindezen feladatokra jó megoldás lehet egy S3-típusú object storage.

<br>

## Mi is az object storage?

Az object storage egy olyan adattárolási megoldás, amelyben az adatokat objektumok formájában tároljuk, és egy API-n keresztül érjük el. Az objektumok magukban foglalják az adatokat és a hozzájuk tartozó metaadatokat, valamint egy egyedi kulcs (key) azonosítja őket a tárolón (bucket) belül.

Amikor eltárolunk egy ilyen helyen egy fájlt, akkor egy azonosítót rendelünk hozzá. Ezek az azonosítók sokszor hasonlítanak egy útvonalra, például "audio/hu/monday/123.mp3", azonban nem utalnak semmilyen mappastruktúrára. A "/" karakter csak segítség a fájlalapú tároláshoz szokott szemnek, hogy könnyebben rendszerezze adatait. Az objektumok névtere azonban nem hierarchikus. A kulcsok előtagjai alapján persze lehet csoportos lekéréseket is végezni. 

<br>

A hagyományos fájlrendszerekkel szemben az object storage elsősorban teljes objektumok tárolására és lekérésére épül. Egy objektum módosításakor jellemzően újra feltöltjük annak teljes tartalmát, nem pedig közvetlenül átírunk néhány bájtot a közepén.

<br>

## Milyen előnyei vannak egy object storage-nak?

### Függetlenség
Az adatokat a szerverünktől független infrastruktúrán tárolhatjuk, így például a VPS fizikai meghibásodása nem feltétlenül jár adatvesztéssel. Ez azonban önmagában még nem nyújt védelmet olyan támadások ellen, amikor a backendünk felett szerzik meg a hatalmat, amely képes írni-olvasni az object storage-ot. Megjegyzem, hogy backupok esetében hozhatunk létre olyan api kulcsot, ami a törlést nem engedi meg. Azonban a törlési jogosultság hiánya nem feltétlenül akadályozza meg az objektumok elrejtését vagy felülírását.

### Tartósság
A függetlenség önmagában nem lenne elég, ha csak egy másik szerverre tennénk például a médiatartalmakat. Lehet, hogy nem zavarnák a letöltések a backendünk működését, de még mindig egy helynek kell balesetet szenvednie, hogy kár érjen bennünket. Ráadásul növeltük a komplexitást.  
Az object storage szolgáltatók azonban olyan cloud rendszereket dolgoztak ki, ahol az adatok elosztott szervereken, redundáns módon vannak tárolva. Az adatokat olyan matematikai eljárással osztják szét, amely lehetővé teszi a hiányzó részek helyreállítását. Mindez azt jelenti, hogy egyetlen fizikai gép meghibásodása nem vezet adatvesztéshez, mert a hálózat többi eleme még mindig tartalmaz elég adatot a helyreállításhoz. Ahol pedig nincs erasure coding, ott általában van replikáció.
A tartósság nem helyettesíti a biztonsági mentést, hiszen a legtöbb esetben a backendünkön keresztül törölhetőek a média tartalmak.
Biztonsági mentések esetében ezért érdemes verziózást, megőrzési szabályokat és – ha a szolgáltató támogatja – Object Lock funkciót alkalmazni. A mentéseket időnként visszaállítással is tesztelnünk kell.

### Könnyű skálázhatóság
Object storage használata mellett a nagyobb forgalom nem jelent jóval nagyobb karbantartási erőfeszítást. A szolgáltató kezeli a tárolási kapacitás bővítését és az infrastruktúra jelentős részét, így nekünk nem kell minden kapacitásnövekedésnél újabb szervereket üzembe állítanunk.


### Sokszor jó ár-érték arány
Ha mindent a szerverünkön tárolunk, akkor idővel nagyobb kapacitású gépre lesz szükségünk, ahogy valamilyen tartalom megnövekedik (például média tartalmak). Lehet, hogy a backend forgalom nem indokolná, de a média kiszolgálása miatt már szükségünk lenne egy drágább szerverre. Ehelyett, ha a médiát kiszervezzük egy object storage-be, olcsóbban tudunk nagy mennyiségű adatot kezelni. Vannak azonban buktatók is, amelyekre érdemes odafigyelni. Ezekről a következő részben lesz szó.


<br>

## Milyen hátrányai vannak egy object storage-nak?

### Elosztott rendszerrel való munka
Elosztott (distributed) rendszerek problémáival szembesülünk, amikor külső szolgáltatót kapcsolunk a rendszerünkhöz. Bár a saját szerveren, egy tartóssá tett mappában való tároláskor is elveszíthetjük az atomikus műveletek kényelmét, külső szolgáltató esetében mindenképpen oda kell figyelnünk, hogy kezeljünk minden lehetséges hibát, biztonságossá tegyük az újrapróbálkozást, takarítsuk el az árván maradt fájlokat. 

Például sikeresen feltöltjük a képet az object storage-ba, de a hozzá tartozó metaadatok mentése sikertelen a PostgreSQL-ben. Ekkor egy olyan objektumunk marad a tárhelyen, amelyre már semmi nem hivatkozik. Egy PostgreSQL-tranzakció visszagörgetése nem vonja vissza az object storage felé már sikeresen végrehajtott műveleteket.

### Közvetlen hozzáférés és forgalomkorlátozás
A kényelemmel együtt, amit a skálázásnál nyerünk, átadunk némi kontrollt is a szolgáltatónak. Például, ha a szerverünk egy szigorú rate limitet használ, az már nem lesz érvényes a képek elkérésére, hacsak nem a szerverünkön keresztül futtatunk minden forgalmat. Azzal viszont veszítünk a teljesítményből. Mindig értékelnünk kell, hogy éppen milyen szempont (biztonság, az elérhetőség, a gyorsaság) mennyire fontos. Ez adott alkalmazáson belül is eltérő lehet a különböző tartalmakra.

### Költségkontroll
Tárhelyként object storage-ot használni sokszor olcsóbb, mint a plusz szerver bérlése, azonban a díjazás több tényezőtől függ. A tárhelyen és az API műveleteken kívül sok szolgáltató a kimenő adatforgalomért külön díjat számol fel. Ez utóbbit szokás __egress__ díjnak nevezni. Például minden alkalommal, amikor egy felhasználó letölt egy hangfájlt az object storage-ból, növekedhet az elszámolt kimenő adatforgalom.
Volt már rá példa, hogy egy cég azért mondott le az object storage megoldásról, mert az egress díj nagyon megemelkedett.  

A másik probléma, hogy nagyon sok szolgáltató nem ad lehetőséget költségplafon beállítására. Sok esetben csak figyelmeztető üzenetet lehet küldetni. Egy tipikus probléma a felhőalapú szolgáltatásokkal.

<br>

## Milyen szolgáltatók vannak?

Ha object storage, akkor legtöbbeknek az _AWS S3 bucket_ jut eszébe. Az _Amazon_ S3 API-ja annyira elterjedt, hogy számos más szolgáltató is biztosít vele részben vagy nagyrészt kompatibilis interfészt. A kompatibilitás mértéke azonban eltérhet, ezért váltás előtt érdemes ellenőrizni a szükséges funkciókat.
További népszerű szolgáltatók: _Google Cloud_, _Microsoft Azure_, _Alibaba Cloud_, _Cloudflare_, _Backblaze_, _Wasabi_, _DigitalOcean_, _Hetzner_, _IBM Cloud_.

Érdemes egy kis kutatást végezni, hogy az adott alkalmazás igényeihez melyik a leginkább megfelelő.

Egy kis alkalmazás sok esetben ingyen vagy alacsony költség mellett is meg tudja valósítani az object storage-integrációt.

<br>

## Integráció

Nagyon sok szolgáltató esetében használható egy S3-ra optimalizált csomag, ahol viszonylag kevés adatot kell módosítanunk (végpont, régió, hitelesítő adatok). NestJS esetében ilyen csomag például az "@aws-sdk/client-s3" és a kapcsolódó "@aws-sdk/s3-request-presigner". Ez autóbbi ahhoz szükséges, hogy a mi backendünk létrehozzon egy "aláírt" linket (__presigned URL__) az adott felhasználónak az adott médiatartalomhoz.

Az object storage lehetővé teszi privát és nyilvánosan hozzáférhető objektumok kezelését is. Privát tartalmak esetén a kulcs ismerete önmagában nem elegendő a letöltéshez. A backend megfelelő jogosultságellenőrzés után például egy időkorlátos, presigned URL segítségével biztosíthat hozzáférést.

<br>

A backend ellenőrzi, hogy a felhasználó jogosult-e hozzáférni az adott tartalomhoz, majd egy időkorlátos, presigned URL-t generál számára. Aki megszerzi ezt az URL-t, az a jogosultság érvényességének ideje alatt szintén hozzáférhet a tartalomhoz. Az object storage az aláírást validálja, az érvényességi időt és a mögöttes hitelesítő adatok jogosultságát. Van lehetőség CDN-en keresztüli felhasználó hitelesítésre is, de az már jelentősen növeli a komplexitást.

<br>

Példa a backend oldali használatra:
```
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// egy service osztály egyik metódusa

  private async signUrl(
    media: ImageBucket,
    key: string,
    windowStart: number,
  ): Promise<SignedUrl> {
    const url = await getSignedUrl(
      media.client,
      new GetObjectCommand({ Bucket: media.bucket, Key: key }),
      {
        expiresIn: media.validitySeconds,
        signingDate: new Date(windowStart * 1000),
      },
    );
    return {
      url,
      expiresAt: new Date((windowStart + media.validitySeconds) * 1000),
    };
  }
```

<br>

## Következtetések
Összességében azt gondolom, hogy érdemes megfontolni az object storage használatát, különösen akkor, ha szeretnénk elválasztani az alkalmazásunk működését az adatok fizikai tárolásától.

<br>

A szolgáltató kiválasztásakor azonban nem elegendő csupán a tárhely árát összehasonlítani. A kimenő adatforgalom díjazása, a hozzáférési jogosultságok, a biztonsági mentések védelme és a költségek korlátozhatósága legalább ilyen fontos lehet.

<br>

A megfelelő választás végső soron az alkalmazásunk igényeitől és attól függ, hogy milyen kockázatokat vagyunk hajlandók vállalni.