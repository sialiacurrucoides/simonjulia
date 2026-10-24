---
title: "Tapasztalataim az AI-jal"
description: ""
date: 2026-10-24
tags: ["backend", "frontend", "DevOps", "security"]
---
<figure class="diagram4">
  <img src="/ai-team.webp" srcset="/ai-team.webp 1x, /ai-team-2x.webp 2x" alt="AI csapatom" width="628" height="785" loading="lazy" />
  <figcaption>AI csapatom</figcaption>
</figure>

<br>

## 2025

2025-ben már javában zajlott az AI-jal gyorsított munka, de én még csak két eszközt alkalmaztam. 
- ChatGPT - megkérdeztem, ha olyan megoldásra volt szükségem, amit korábban még nem alkalmaztam, vagy részfeladatokat gyorsítottam vele (például regextervezés). A végső megoldást én adtam a kódbázishoz.
- Copilot - néha mint autocomplete, vagy olyan kisebb feladatoknál, hogy foglalja össze a kapott hiba lényegét és javasoljon megoldást. Nem voltam lenyűgözve. Volt olyan, hogy lassan fél órája dolgozott, de nem találta meg a helyes irányt. Amikor pedig átvettem tőle, akkor 10 perc alatt megvolt. Ebben a fázisban még nehezen tudtam elképzelni, hogy az AI elvegye a fejlesztők állását.

<br>

## Claude Code - ismerkedés

2026 májusában már úgy tűnt, hogy mindenhonnan a Claude Code köszön vissza. Szóval elhatároztam, hogy én is kipróbálom. Tanultam róla egy kicsit, hogyan kell vele elindulni, és az eredmény egy lényegesen új élmény volt. Olyan megoldásokat javasolt, hogy azt éreztem: minden idők legnagyobb tudású seniorja segít nekem. Persze ehhez biztosítani kellett a megfelelő környezetet, mert akkoriban még sok mindent fel lehetett róni neki: kérdés nélkül csinál valamit, amit nem kellett volna, nem csinál meg olyasmit, amit igen, elkezd hallucinálni.

<br>

Ahogy én indultam:
- `/init` - egy CLAUDE.md-fájl generálása a kódbázishoz
- hozzáírni a legelejére __Karpathy__ négy szabályát, nem is a teljes skillt, csak négy sort (https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md)
- hozzáírni még két szabályt, amit mások javasoltak:
    - "Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets."
    - "NEVER commit directly to [master/main/prod - fill which is relevant]"
- installálni a __Context7 MCP-t__, hogy be tudja gyűjteni a legfrissebb információkat a különböző eszközökről/csomagokról
- bemásolni a skills mappába néhány népszerű skillt, ami adott témában hasznos (accessibility, web-security, modern-tailwind és így tovább). A skillgyűjtést nem szabad túlzásba vinni, mert már a skillek neve és leírása is helyet foglal a kontextusban. A backend kódbázis nem látott rá a frontendspecifikus skillekre.
- minden feladat után `/clear`, hogy optimalizáljuk a tokenhasználatot és csökkentsük a hallucinálás esélyét
- minden promptot plan módban küldtem el

<br>

Eleinte nagyon paráztam a biztonság miatt, hogy nehogy olyasmit csináljon, amit nem kellene. Például, hogy kitörli a prod db-t, mint amire már volt példa a történelemben... Szóval eleinte mindenre engedélyt kellett kérnie. Egy jó ideig még minden egyes lintfuttatásra is...

<br>

## Mézeshetek

A kezdeti szkeptikus indulás után, amikor még azt hittem, hogy mindent meg kell mondanom, hogyan csináljon, hamar rájöttem arra, hogy ha tisztán specifikálom a célt, akkor még jobb tervvel is elő tud állni, mint én. Őszintén le voltam nyűgözve, hogy milyen sok határesetet azonosít, mi mindenre ír tesztet, és milyen kérdéseket kapok vissza tőle. El is kapott a hév, már a kód nagy részét ő írta.

<br>

## Bizonytalanság

A gyorsan generált kód aztán kicsit megbosszulta magát és belassultam, ahogy a hibákat javítgattam. Meglepően sok dolgot elrontott frontenden, még azután is, hogy megkapta a Playwright MCP-t. Még mindig nem voltam biztos benne, hogy le tud cserélni egy fejlesztőt. Az ellenőrzés nem volt opcionális. Amellett, hogy a legjobb gyakorlatokról tudott, előfordult, hogy beleírt egy secretet egy yml-fájlba. Esetemben nem volt jelentős a veszély, mert ha nem veszem észre, a git hook secret scannerje is valószínűleg megfogja. Mindazonáltal az ilyen tapasztalatok miatt nem bízhattam benne teljesen. Minden egyes sort átnéztem.

<br>

Mondhatjuk, hogy már senki nem ellenőrzi a compilert vagy a használt package-ket, de azok determinisztikusak. A modell, bármilyen okos is, statisztikai alapú, így a hibázásnak mindig van esélye.

<br>

A munkafolyamat átalakult, a nap nagy része specifikációírás, review és manuális tesztelés volt. Pont azt a részt vesztettem el, amit amúgy a legjobban szerettem a fejlesztésben: kitalálni, hogyan oldjak meg egy problémát és megírni hozzá a kódot. 

<br>

Az is egyértelművé vált, hogy a kódot idővel egyre nehezebb lesz érdemben átnézni, mert nincs már meg az a mentális modell, ami úgy tud felépülni, hogy te küzdöttél meg minden lépéssel, minden hibával. Ha céges környezetben lettem volna, talán utolért volna egy depresszív állapot. Szerencsére sabbaticalon voltam, és így a fő fókuszomban a tanulás volt. Hogyan fejlesszek ki egy terméket egyedül, a nulláról, úgy, hogy más is nyugodtan használni tudja. Ilyen szempontból az AI jelentette előnyök lelkesítően hatottak.

<br>

A saját kódhoz képesti gyengébb mentális modell miatt minden érdemi változtatás után futtattok egy vagy több review-t.

<br>

## Szintet lép a kapcsolat

A Claude Code-ökoszisztéma egyre nőtt, és sejthető volt, hogy azokkal a problémákkal, amikkel én találkoztam, találkozott más is, és már megoldás is született rájuk.

<br>

### Széteső és AI slop frontend:
- __frontend-design__ skill - jobb frontend komponensek, jobb spacing, kevesebb csúnya megoldás
`npx skills add anthropics/skills --skill frontend-design`
- __impeccable__ - a fenti önmagában még nem segít abban, hogy a design egységes maradjon és hasonló elveket kövessen végig. Az impeccable meginterjúztat, hogy mi a cél, és annak függvényében összeállít egy designtervet
`https://github.com/pbakaus/impeccable`

<br>

### Biztonság:
- __security-guidance@claude-plugins-official__ plugin - automatikus biztonsági ellenőrzés - némileg növeli a költségeket, de én bevállaltam
`/plugin install security-guidance@claude-plugins-official`
- __claude-code-security-audit__ - `https://github.com/McGo/claude-code-security-audit`
- __security-audit__ - `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`

<br>

### Tokenfogyasztás:
- __codegraph__ - segít gyorsan feltérképezni a kódbázist, nem kell annyi információt elküldeni az Anthropic szervereire

 `https://github.com/colbymchenry/codegraph`
- __rtk__ - Rust-alapú program, ami csökkenti a Bash-parancsok kimenetének méretét, amit az ügynök olvas 

`https://github.com/rtk-ai/rtk`

Ami még népszerű, de én nem használom, mert nem szeretném csökkenteni a válaszok érthetőségét:
- __caveman__

`https://github.com/juliusbrussee/caveman`

Szintén népszerű:
- __ponytail__ - kevesebb kód írására ösztönzi az ügynököt

`https://github.com/dietrichgebert/ponytail`

<br>

Számos hasznos eszköz van még, nem sorolnám fel mindet. Nem is érdemes mindent begyűjteni. A túl sok is árthat a minőségnek. Érdemes egyszerre egy újat bevezetni és csak akkor megtartani, ha tényleg hasznos az adott projektben.

<br>

Az igazi szintlépést számomra az Opus 5.5 modell hozta, bár a Claude Code harness fejlődése is hozzájárult. Ma már nagyon ritka, hogy a modell valamiben hibázik. Ehhez feltehetőleg hozzájárul a memóriája is, ami tartalmazza a korábbi hibajelentéseimet. Ma már nem olvasok el minden kódsort. Tudom, hogy megfelelő unit tesztet tud írni arra, hogy a controller jól továbbítja az értékeket a service-nek. Ha az adott komponens minden nézetben és minden témában jól néz ki, nem kell minden JSX-sort végignéznem. Nem mintha mély emléknyomot tudna hagyni. Így csak az időt vinné el. 

Ettől függetlenül még nagyon sok mindent átnézek, de már kevésbé a hibadetektálás miatt, mint azért, hogy tudjak minden kisebb döntésről is, amire esetleg nem kérdezett rá a tervezés során.

<br>

A jelenlegi munkám lényege, hogy irányítok és döntéseket hozok: minek van elsőbbsége, mi van összhangban a termék jellegével, minek milyen költségvonzata van, mi alkalmasabb emberi felhasználásra.

<br>

## Összefoglaló

Egy éve még nem gondoltam volna, hogy ilyen hamar eljutunk odáig, hogy a programozók azon gondolkodjanak, hogy átképezzék-e magukat villanyszerelőnek. Megfelelő AI-használattal jelenleg úgy tűnik, hogy kevesebb ember is elég adott feladatra, főleg ha greenfield projektről van szó.  
Azért azt nem hiszem, hogy vége lenne a szakmának. A látnok vállalkozó, aki talált egy problémát, amire a válasz egy monetizálható szoftver, valószínűleg inkább foglalkozik üzletfejlesztéssel, mint azzal, hogy terminálokba írogasson. 

<br>

A szoftver működésével kapcsolatos tudásnak szerintem még mindig van értéke. Legyen a modell bármilyen jó, én nem mernék letölteni egy olyan alkalmazást, amit olyan valaki vibe-kódolt, akinek nem mond semmit az, hogy CSP, CORS, secret manager, MFA, passkey, idempotencia, backup, GDPR-compliance és sorolhatnám. Ezekről az AI mind tud, de adott esetben külön kell kérni, hogy foglalkozzon velük. Sokszor pedig választani kell, hogy mi a fontosabb (lásd pl. CAP-tétel a konzisztencia és rendelkezésreállás viszonyáról), nem mindig lehet, hogy a kecske is jóllakjon, és a káposzta is megmaradjon.