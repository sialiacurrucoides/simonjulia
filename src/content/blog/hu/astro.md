---
title: "Astro JS-ről"
description: "Astro egy JavaScript webes keretrendszer, amelyet gyors, tartalomvezérelt webhelyek készítésére optimalizáltak."
date: 2026-03-11
tags: ["frontend", "astro"]
---
Egyszerű, dominánsan statikus oldal készítésénél dilemmában voltam, hogy használjak-e egy SSR-t (szerver oldali renderelést) lehetővé tevő eszközt, mint például a Next.js, vagy maradjak a vanilla HTML + JavaScript megoldásnál. Ez utóbbi előnye, hogy valószínűleg kevesebb olyan problémába futok bele, mint például miért különbözik a dev és a prod változat, időnként miért olyan nagyon lassú egy-egy funkció, milyen előnyöket veszítek el, ha nem a Vercelt használom host-nak. Hátránya viszont, hogy elveszítünk sok hasznos mintát, előre elkészített optimalizációt, könnyebben írunk spagetti kódot és a legrosszabb, hogy nincs TypeScript, a kedvenc védőhálónk.

<br>

Így amikor megismertem az __Astro__-t, őszinte öröm töltött el, úgy éreztem, hogy megoldást jelent a fenti dilemmára. Az Astro nyelve egy HTML superset, ami azt jelenti, hogy felturbózott HTML. Aki ismeri a HTML alapokat és találkozott már a JSX szintaxissal, teljesen otthonosan fogja érezni magát. Ráadásul a _TypeScript_ alapértelmezetten támogatva van.

```
---
    import { Product } from "../types"
    import { currency } from "../constants"

    const fruits = ["apple", "pear", "orange"];

    const myProduct: Product = {
        name: "Test",
        price: 1000,
    }
---

    <ul>
        {myList.map((fruit) => (
            <li>{fruit}</li>
        ))}
    </ul>
    {myProduct && <p>{myProduct.name} costs {myProduct.price} {currency}</p>}
    <br>

```

<br>

Ahogy a fenti példából látható, kapcsos zárójelben használhatunk változókat, amelyeket a __frontmatternek__ nevezett „„---”-val” határolt területen adhatunk meg. Lényegében minden olyan JSX jellegű műveletet megcsinálhatunk, aminek az eredménye szöveggé alakítható. Azonban függvényt például nem rendelhetünk pl. egy click attribútumhoz. Ebben az esetben vagy __script__ tag-ben használjuk a klasszikus imperatív megoldást (document.querySelector) vagy hozzáadjuk a projekthez kedvenc keretrendszerünket (__React__, __Vue__, __Svelte__, __Preact__ ...) egy sima _"add"_ paranccsal, és készítünk egy komponenst, amit behívunk. Előny, hogy a választott keretrendszerhez szükséges kódot nem töltjük le az összes oldalnál, csak annál, ahol használva van.

<br>

A dinamikus részek kezeléséhez, az Astro bevezette az __Astro szigetek__ fogalmát. Ezek olyan kódrészletek, ahol explicit jelölni kell, hogy nem csak statikus HTML-t szeretnénk látni és erre vannak a __client direktívák__, hogy mikor történjen meg a JavaScript betöltése.
```
    <MyReactComponent client:load />
``` 

<br>

Az Astro kép optimalizációban is hatalmas segítséget jelent. Az __Image__ és a __Picture__ komponensek egyrészt a legjobb gyakorlatok használatára köteleznek (alt tag megadása, automatikusan lazy loading-ot állítanak be), másrészt lehetővé teszik, hogy a felhasznált kép az ideális méretben és formátumban jelenjen meg. A Picture komponens előnye az Image-hez képest, hogy egy egész sor képformátumot adhatunk meg (pl. formats={['avif', 'webp', 'png']}). Így pl. a PNG képünket, az Astro elkészíti az optimalizált formátumokban és annak függvényében küldi le az egyiket vagy másikat, hogy az adott böngésző mit támogat.

<br>

Az Astro kíválóan alkalmas olyan oldalak készítésére, ahol sok a statikus tartalom, mint amilyenek a blogok. Ebben az esetben __markdown__ file-okban megírható a tartalom, és a posztok dinamikusan megjeleníthetőek. A pages mappában létrehozott file-ok automatikusan megfelelnek egy útvonalnak, de ha a file név szögletes zárójelben van, akkor a _getStaticPaths_ függvény segítségével legenerálható az összes útvonal, ami az adott paramétert használja (pl. mydomain/posts/[post-slug]). A markdown fileokat pedig be lehet hívni egy gyűjteményként a _getCollection_ függvény segítségével, ami az _astro:content_ API része.

<br>

Bár a fentiek alapján levonhatnánk azt a következtetést, hogy csak statikus oldalak esetében használható az Astro, az igazság azonban az, hogy egyre bővül az eszköztára. A dinamikus kollekciókkal, a nemrég bevezetett session-el, a tervezett caching funkciókkal egyre több lehetőséget ad a fejlesztők kezébe. Szerver módban már sok mindent meg lehet csinálni, amit pl. Next.js-el meg lehet.  
Kíváncsian várom, hogy alakul majd ennek a keretrendszernek a jövője.