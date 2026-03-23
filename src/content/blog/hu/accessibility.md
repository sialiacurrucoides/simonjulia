---
title: "Akadálymentesítés"
description: "Az akadálymentesítés célja, hogy elérhetővé tegyük az internetes tartalmakat mindenki számára. Egyes becslések szerint a felhasználók 15%-a küzd valamilyen nehézséggel, ami miatt kisegítő technológiát kell használnia. A jelen cikkben igyekeztem összegyűjteni pár hasznos információt, amelyeket érdemes szem előtt tarthatunk, hogy használhatóbb honlapokat készítsünk."
date: 2026-03-19
tags: ["frontend", "UX", "accessibility"]
---
Amikor hallottam a 15-16%-ot (WHO becslés), kicsit meglepődtem. Azonban ha belegondolunk, egyáltalán nem ritka, hogy valakinek nehézsége adódik valamelyik érzékszervével vagy akár kognitív funkciójával. Például az öregedéssel sokak látása romlik. Ilyenkor megoldás lehet, hogy ránagyít az oldalra, de egy olyan apróság, hogy a szöveg nem igazodik a kijelző méretéhez, meglehetősen megnehezítheti az olvasást. Hiszen minden sornál vissza kell görgetni az oldal elejére.  
A komoly születési vagy betegségből adódó nehézségeket viszont sokaknak elképzelni is nehéz, amikor például egy súlyosabb motoros diszfunkció miatt összesen csak két nagy gomb áll az illető rendelkezésére, hogy interakcióba lépjen az oldallal. Akkor tényleg nem mindegy, hogy az oldal mennyire támogatja a könnyebb navigációt. Akadálymentesítéssel olyanok is kapcsolódni tudnak a világhoz, akik eddig erre nem volt lehetőségük.  
Az akadálymentesítés nem „edge-case" fejlesztés, mindenki számára javíthatja a használatot. Példaként gondolhatunk azon esetekre, amikor erős fényben, tükröződő mobilképernyőt nézünk vagy amikor csak egy kézzel tudunk navigálni, mert a másik foglalt vagy sérült.  
Arról is érdemes tudni fejlesztőként vagy designerként, hogy az EU-ban minden közszférában működő szervezet internetes honlapjának kötelező megfelelnie az elérhetőségi irányelveknek ((EU) 2016/2102).

<br>

## Eszközök amelyekkel tesztelhető az oldalunk

<br>

### Tab, Enter, Space
Az egyik legegyszerűbb teszt, hogy ha a tab segítségével végignavigálunk az oldalunkon.  A tab lenyomásával haladunk az oldalon a fókuszálható elemeken át. Az Enter és Space gombokkal pedig aktiválhatjuk az elemeket. Ilyenkor kiderül, ha például a hamburger menünk nem is fókuszálható, mivel nem gombként lett létrehozva és tabindex-el se rendelkezik. A látásukban vagy mozgásukban jelentősen korlátozott személyek nem használnak egeret. Sokszor néhány gombra tudnak csak támaszkodni, miközben egy képernyő olvasót használnak.

<br>

### Képernyő olvasók 
A Mac gépeken alapból elérhető a __VoiceOver__ alkalmazás, amit elindítva a program felolvassa a képernyőt és kiderül, ha érdemi információk hiányoznak. Például, ha egy ikont használtunk gomb-ként, de semmilyen hozzárendelt "title" vagy "label" nem árulkodik arról, hogy milyen gombról van szó. Windows felhasználók számára pedig, ingyenesen elérhető az __NVDA__ szoftver. Mobil telefonokon szintén vannak képernyőolvasók (VoiceOver, TalkBack).

<br>

### Rendering tab of Chrome developer tools
 Ha nem tudod, hogy hozd elő, "Command + Shift + P"-vel rákereshetsz a _rendering_ kifejezésre. Itt például az _Emulate vision deficiencies_ rész segítségével meg tudod nézni, hogy milyen típusú látási nehézségnél, hogyan néz ki az oldalad. A Chrome-ban van egy Accessibility fül is, ami szintén hasznos lehet.
<figure>
  <img src="/devtools_rendering.webp" alt="Chrome dev tools rendering" loading="lazy" style="max-width: 90vw;" />
</figure>

<br>

### Lighthouse in Chrome
Az oldal akadálymentességét tesztelni lehet a Lighthouse futtatásával, és visszajelzéseket kapunk, hogy mit lenne érdemes javítani. Érdemes azonban tudni, hogy ha egy logikailag fontos elemünk nem fókuszálható, nem biztos, hogy jelzi nekünk, mert dekorációnak tekinti. Így nem helyettesíti a kézi ellenőrzést.

<br>

### aXe extension
Létezik Chrome extension és VS Code plugin is. Vegyesek a vélemények, de hasznos lehet, hogy rámutasson a hibákra. A plugin jelöli az egyértelmű mulasztásokat.

<br>

## Javaslatok fejlesztőknek

- Tartsuk szem előtt, hogy a képernyő olvasók a html sorrendjét követik, nem a vizuális elhelyezkedést a képernyőn. CSS trükkökkel bármit bárhova mozgathatunk, de ha nincs jó helyen a DOM-ban, akkor a logikus sorrend megbomlik.
- Régi történet, de igyekezzünk a szemantikus tag-eket használni. Ha gombot szeretnénk létrehozni, formázzuk a _button_ tag-et, ne egy _div_-et. Hiába tesszük fókuszálhatóvá egy tabindex-el, attól még nem lesz automatikusan kattintható. Továbbá a képernyő olvasóknak van gyors menüje, ami például a különböző _h_ tageken keresztül tud ugrálni.
- A címeknél tartsuk be a hierarchikus sorrendet a h tagek használatánál. A h1 után ne használjunk egyből h4-et, csak mert nem akarunk nagy betűket. Inkább formázzuk a h2-t.
- Önmagukban álló ikonoknak mindig adjunk vagy 'title'-t vagy 'aria-label'-t.
- Form elemeknél mindig legyen összekapcsolva a _label_ az _input_-al
- _aria-labelledby_ használható, hogy egy nem szöveges elem leírására tudjunk mutatni. Például egy kép címe egy p tagben van, aminek van egy id-ja. Ezt az id-t kell hozzárendelnünk a képen használt _aria-labelledby_ tulajdonsághoz.
- Ellenőrizzük, hogy tab használattal kikerül-e a fókusz a látható területről. Például hamburger menü után sok tab nyomásig nem látunk semmi fókuszált elemet, mert bár nem nyitottuk meg a menüt, a tab végighalad az elemein.
- Ne vegyük le az "outline"-t, ha nem kezeljük másképpen a fokuszált állapotot, például a :focus-visible pseudo-class segítségével.
- Tegyünk tabindex=0-t a nem fókuszált, de fókuszálandó elemekre, de ne használjunk magasabb értéket, mert az anti-pattern.
- Ha nagyon sok elemű a navigációnk, akkor tegyünk elérhetővé egy "skip link"-et, amivel egyből a tartalomhoz lehet ugrani.
- Mindig férjen bele a szövegünk a képernyőbe, ne kelljen horizontálisan scrollozni.
- Az oldalak működjenek 200%-os nagyításon is.
- Használjunk alt szöveget a képeken.
- Az axe-core npm package segítségével írhatunk automatizált teszteket, amelyek az akadálymentességre fókuszálnak
- Ismerkedjünk az ARIA tulajdonságokkal és tartsuk szem előtt, hogy ezek csak szemantikai többletet adnak az elemeknek, a viselkedését vagy akár a fókuszálhatóságát nem befolyásolják. Az aria használat inkább B terv legyen, mint megoldás. Ahol lehet támaszkodjunk a natív HTML elemekre.
- Időnként ellenőrizzük a honlapunkat a fenti eszközökkel és javítsuk az előkerülő hiányosságokat. Ma már nem kell fejben tartanunk minden szintaxist, mert hamar megkereshető a megoldás. A problémát azonban nekünk kell megtalálnunk.
- A figyelmeztető elemeket (alert), helyezzük rögtön a body tag nyitása után, hogy könnyebben meg lehessen találni őket a kisegítő technológiákkal. Ha nem életbevágó, használjuk az aria-live="polite" beállítást, hogy ne legyen túl intrúzív a figyelmeztetés.
- Felugró ablak (modal) megnyitásakor a fókuszt belül kell tartani, bezáráskor pedig vissza kell állítani.
- Használjunk hasznos validációs üzeneteket, és egyértelműen jelezzük, mi kötelező és mi opcionális mező.
- Adjuk meg az oldal nyelvét: `<html lang="hu">`
- A túl sok animáció szédülést vagy kognitív túlterhelést okozhat, érdemes lehet kikapcsolni őket a preferenciáknak megfelelően:
```
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
```

<br>

## Javaslatok designereknek

- Kattintható elemek ne legyenek túl kicsik vagy túl közel egymáshoz, hogy tökéletes motoros precizitás kelljen a kezelésükhöz.
- A fontos kontroll elemek legyenek elöl az oldalon, hogy ne kelljen végignavigálni a teljes oldalt, hogy elérhessük. Például a kosár legyen a felső menüben, ne alul.
- Figyeljünk a színek kontrasztjára. A háttérhez képest egy normál szöveg legyen legalább 4.5-es kontrasztú, egy cím pedig legalább 7-es. (Túl magas kontraszt viszont fáraszthatja a normál szemet, nem kell minden fekete-fehér legyen.)
- Ha belefér a költségvetésünkbe, tervezzünk egy gombot, amivel diszlexia barát szövegre válthat a felhasználó.
- Hanganyag mellé tervezzünk elérhető feliratot vagy átiratot. Elegáns megoldás lehet, ha a videó mellett van egy panel, ahol megjelenik a szöveg és mindig ki van emelve az a rész, ami éppen elhangzik. Az egyszerű felirathoz képest, itt több a kontextus, ha valaki lassabban olvas, még láthatóak a korábbi mondatok.
- Az információt nem szabad pusztán színekkel közvetíteni.
