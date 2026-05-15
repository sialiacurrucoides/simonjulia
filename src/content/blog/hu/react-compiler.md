---
title: "React compiler"
description: "A React compiler egy olyan eszköz, ami a fejlesztők helyett elvégzi a komponensek memoizációját, minden olyan helyzetben, ahol ezt biztonságosan meg tudja tenni, ezáltal javítva az applikáció teljesítményét."
date: 2026-05-15
tags: ["frontend"]
---
## Mire jó?
A React compiler elvégzi azokat az optimalizációkat, amelyeket különben a fejlesztőnek kellene megtenni a `useMemo`, `useCallback` és `React.memo` segítségével. Mindezt build időben, szóval a kód is egyszerűbb marad. Ezáltal időt spórol és segít elkerülni a felsorolt eszközök helytelen alkalmazását. Jelenleg opcionális eszköz, de a jövőben lehetnek olyan React funkciók, amelyek szorosabban építhetnek a compiler működésére.  

<br>

Az `eslint-plugin-react-hooks` jelenléte a projektben segít, hogy a linter szóljon, ha olyan kódot írunk, ami megakadályozza az optimális memoizációt.
A React Compiler akkor tud hatékonyan működni, ha a komponenseink tiszták (pure), vagyis ugyanabból a bemenetből mindig ugyanazt a kimenetet adják vissza, és renderelés közben nem végeznek mellékhatásokat.

<br>

## Hogyan adjuk a projekthez?
Elsősorban React 19 használata mellett ajánlott, de megoldható, hogy 18 vagy 17-es React-es projektben is alkalmazzuk.
A React dokumentációja érthetően bemutatja, hogy milyen projekttípus esetében, hogyan használható.
Egy új Vite (@vitejs/plugin-react 6.0.0-nál magasabb verzióval) + Typescript projekt esetében a következő eszközök installálása javasolt:
```
npm i -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler @types/babel__core
```

<br>

A `vite.config.ts` fájlt a következőkkel kell kiegészítenünk:
```
...
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    ...,
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    ...
  ],
  ...
})
```
Mindig érdemes a legfrissebb dokumentációt követni, mert a compiler ökoszisztéma még elég gyorsan változik.

<br>

Ellenőrizhetjük, hogy sikerült-e, ha a React Developer Tools-t használva látjuk a kis Memo jelöléseket a komponens fában.
<figure>
  <img src="/react_dev_tools.webp" alt="React Developer Tools komponens nézet" loading="lazy" />
  <figcaption>React Developer Tools komponens nézet</figcaption>
</figure>

<br>

## Mire figyeljünk, amit nem old meg helyettünk?
Előfordulhat, hogy egy projektben érthetetlen lassulásokat tapasztalunk. Ilyen eset lehet, amikor külső könyvtárból kapott objektumot adunk meg függőségnek, feltételezve, hogy elvégezték a memoizációt. Ilyenkor kiderülhet, hogy csak az objektum egyes elemeire igaz ez, nem a teljes objektumra és ha csak a használt elemet adjuk meg függőségként, akkor elkerülhetjük a felesleges újrarendereléseket.  
Ahhoz, hogy maximálisan ki tudjuk használni a compiler nyújtotta kényelmet és előnyöket, továbbra is fontos értenünk, hogy milyen tényezők azok, amelyek lassuláshoz vezetnek.
Fontos szem előtt tartani, hogy ez az eszköz a renderelést optimalizálja, továbbra is oda kell figyelnünk a megfelelő állapot kezelésre, helyes adatstruktúrákra, számítások optimalizálására.