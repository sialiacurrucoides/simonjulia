---
title: "Turborepo"
description: "A Turborepo egy monorepo-kezelő eszköz, ami a párhuzamosítással és cacheléssel maximalizálja a build sebességet, hogy könnyűvé váljon a közös package-ek használata több applikáció számára."
date: 2026-05-11
tags: ["backend", "frontend"]
---
## Mi a monorepo?
A monorepo egy olyan kódbázis (repository), ahol több applikációt egy helyen kezelünk többek között abból a célból, hogy a közös erőforrásokat ne kelljen duplikálni, ezáltal pedig több helyen módosítani. Közös erőforrásokon osztozhat a web app és az admin app, a web app és a mobil app, a bármilyen frontend és a backend, a dokumentációért felelős app, a marketingért felelős app. Ezeknek sokszor érdemes külön applikációt fenntartani, mert más tech stack ideális a számukra illetve, mert egymástól függetlenül skálázandók.  
Közös erőforrások lehetnek a típusok, az alapvető typescript konfigurációk, a fordítások, az API hívások, UI elemek, ha több webes applikációról van szó (pl admin és publikus web app), business logikát tartalmazó függvények.  

<br>

Természetesen egy nyilvános projekt esetében nem feltétlen van erre szükség, mert npm package-ként publikálhatjuk azokat az egységeket, amelyeket minden applikáció használ. Azonban nagyon sok esetben üzletkritikus és emiatt nem publikus kódról van szó. Ilyen esetben is lehetőség van például belső nyilvántartást (registry) felállítani, de az inkább csak az igazán nagy vállalatoknál jellemző. Egy kisebb projekt esetén, azonban sokszor egy monorepo jobb választás lehet. Természetesen nagyobb projekteknél is megvan az előnye. Monorepo struktúrát használ a _Next.js_, _Vue.js_, _Angular_, _React_, _Typescript_, _npm CLI_, _Jest_, de a _Google_ is.

<br>

## Turborepo jellemzői
A Turborepo előnye, hogy indulási konfiguráció nélkül, out-of-the-box monorepo struktúrát hoz létre, amihez a `create-turbo@latest` parancsot használhatjuk. Indulásból kapunk egy apps mappát az applikációknak és egy packages mappát a kiegészítő eszközöknek. A packages-en belül van egy `typescript-config` és egy `eslint-config` package.
A turborepo appokat egyszerre is lehet buildelni és mivel determinisztikus, hash-alapú cache-elést használ, ezért az újabb buildek esetében csak azokat az egységeket buildeli újra, ahol változás történt, tehát invalidálódott a cache. Ha például módosul egy UI package, csak az arra épülő applikációk buildelődnek újra.  
Emellett párhuzamos folyamatokat futtat (test, lint stb), ami miatt sok CI és lokális build idő is megspórolható.

<br>

A Turborepo önmagában nem package manager, általában workspace-alapú package managerrel együtt használható, például _pnpm_-mel, _yarn_-al, _npm_-el.

<br>

A Turborepot megvásárolta a Vercel, ami egyrészt jelentős támogatottságot jelent, másrészt alapból két Next.js app-ot kapunk inicializáláskor ("^2.9.6" verziónál legalábbis): egy web appot és annak a dokumentációjáért felelős appot. Ezeket természetesen nem muszáj megtartani és bármilyen más appot létrehozhatunk az apps könyvtárban: pl. expo-t mobilnak, vite-et adminnak, astro-t marketing oldalnak.  
A Turborepo működésének központi eleme a `turbo.json` fájl, ahol meghatározhatjuk, hogy az egyes taskok (pl. build, lint, test, dev) hogyan függnek egymástól, milyen fájlokat cache-eljen a rendszer és milyen sorrendben fusson le a pipeline. A Turborepo __dependency graph__ alapján dönti el, hogy mely package-eket és alkalmazásokat kell újrafuttatni. Egy egyszerű konfiguráció például így nézhet ki (2026-os verzió):
```
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "with": ["api#dev"],
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```
A `dependsOn` mező segítségével megadhatjuk, hogy egy task csak akkor fusson le, ha a függőségei már sikeresen lefutottak.  
Az `outputs` mező azt definiálja, hogy mely generált fájlokat cache-elje a Turborepo. Ennek köszönhetően a későbbi build folyamatok jelentősen gyorsabbak lehetnek, különösen CI környezetben vagy nagyobb monorepok esetén.  
A `with` mező lehetővé teszi más taskok párhuzamos indítását.

<br>

A Turborepo lokális használata és a local cache ingyenes, csak ha cloud CI-erőforrásokra van szükség (Vercel remote cache), akkor kell az árakat mérlegelnünk.

<br>

## Új package-ek hozzáadása
Új package létrehozásakor arra kell figyelnünk, hogy hozzunk neki létre egy `package.json` fájlt, ahol megadjuk a nevét. Érdemes prefixálni pl. `@myorg/api`, ami alapján megadhatjuk függőségként bármelyik applikációnknál: 
```
"@myorg/api": "*",
``` 
Arra kell odafigyelnünk, hogy mindenképp adjuk meg az __exports__ mezőt, ahol meghatározhatjuk, hogy mely fájlok elérhetőek a felhasználó applikációk számára. Ha egy kis package-ről van szó és mindent elérhetővé teszünk, megadhatjuk a következőképpen:
```
"exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.ts"
    }
  }
```
Az új package-nek rendelkeznie kell egy tsconfig.json fájllal is. Ennek egy egyszerű formája a következőképpen nézhet ki:
```
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
<br>

## Typescript config kezelés
Nagyon hasznos, ha minden projektünk hasonló szigorúságú typescript szabályokat alkalmaz. Azonban nagy valószínűséggel lesznek eltérések a különböző applikációk konfigurációiban. Ezért az egy működő stratégia, hogy a `tsconfig-config` package-en belül van egy `base.json` fájlunk, ami a közös beállításokat tartalmazza. Pl:
```
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```
Minden egyes appnak pedig készítünk egy saját JSON fájlt, ami hivatkozik a base-re és kiegészíti azt. Például:
```
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  }
}
```

<br>

Az egyes applikációk pedig a saját _tsconfig.json_ fájljukban csak hivatkozzák a rájuk specifikus JSON fájlt, pl.:
```
"extends": "@repo/typescript-config/vite.json",
```

<br>

## Előnyök és hátrányok
Van pár dolog, amiről érdemes tudni mielőtt elköteleződünk. 
- A deployment folyamatát bonyolíthatja, hogy ugyanabból a repositoryból csak egyetlen alkalmazást szeretnénk kitenni.  
- A használatához szintén bele kell egy kicsit szokni. Lehet, hogy lokálisan futtatva egy import működik, de csak később derül ki, hogy production módban nem jó, mert például elfelejtettük a releváns package-t függőségként megadni.
- Kezdőknek szintén okozhat némi fejtörést, hogy átlássák a függőségeket és, hogy milyen konfigurációt hol kell megadni. Például hiába jött létre egy gitignore fájl az újonnan inicializált app-ban, a gyökérkönyvtárban megadott szabályok fognak számítani. Más fontos konfigurációs fájlok is itt találhatóak, így többnyire innen kell indítani a deploy-t is.
- Monorepo/Turborepo környezetben fontos, hogy minden React-et használó package ugyanazt a React és ReactDOM verziót használja. A shared package-ekben a React-et peerDependency-ként érdemes definiálni vagy minden applikációnál fixálni a React verziót, különben könnyen előfordulhat több React instance betöltése, ami runtime hibákhoz (pl. Invalid hook call) vezethet.
- Ugyancsak hátrány lehet, hogy a git history bonyolultabbá válik és megnőhet a CI checkout idő.
- Azt is érdemes szem előtt tartani, hogy minden fejlesztő rálát mindegyik projektre. Ez kisebb csapatoknál előny is lehet, de nagyobb cégnél, ahol rotációban dolgozik sokféle fejlesztő, hátránynak is számíthat.  

<br>

Egyértelmű előnye azonban, hogy ha egy olyan projektünk van, amit folyamatosan kell fejleszteni, akkor nem kell több helyen ugyanazt javítani, ha kiegészül egy típus, módosul egy API hívás, egy fordítás, egy logika. A különböző egységeken dolgozó fejlesztők pedig lényegét tekintve ugyanazon stratégiát követik typescript, lint, git-hooks esetében. A build időt pedig olyannyira optimalizálták, hogy a több alkalmazás egy repositoryban történő kezelése általában nem jelent számottevő teljesítményproblémát.
