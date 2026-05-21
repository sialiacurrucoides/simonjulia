---
title: "TanStack Router TanStack Query-vel"
description: "A méltán egyre népszerűbb TanStack Router típusbiztos útvonalkezelést tesz lehetővé, és könnyen kombinálható a szerveroldali állapotkezelésre széles körben használt TanStack Queryvel."
date: 2026-05-21
tags: ["frontend"]
---
## Mikor használjuk?

Talán kijelenthető, hogy a React ökoszisztémában a Next.js applikációk váltak dominánsá, amelyek a szerver oldali renderelést helyezik a középpontba és újragondolják a külső forrásból származó adatok kezelését, meghatározzák az útvonalkezelés alaplogikáját. Azonban nem minden esetben ez a legelőnyösebb stratégia. Például ha olyan applikációt fejlesztünk, amiben minden funkció bejelentkezés után érhető el, nagyon intenzív az adatforgalom, nem Vercel infrastruktúrán futtatjuk az alkalmazást, akkor egy Vite-alapú alkalmazás TanStack eszközökkel jobb teljesítményt és fejlesztői élményt nyújthat.

<br>

## TanStack Router

A TanStack Router kétféle logikát is megenged útvonalkezelésre, de a fájl alapú stratégiát javasolja. Ez már ismerős lehet a Next.js App Router használatából. A fájl neve megfelel az útvonalnak. 
A dokumentáció tisztán leírja az alap konfigurációkat, hamar elkezdhetjük az eszköz használatát. Egy új útvonalhoz nulla AI tokent kell elhasználnunk 🙂, hiszen ha fut a dev szerver, akkor a router plugin automatikusan legenerálja az útvonal meghatározó kódját, amint elneveztünk egy fájlt. Tetszés szerint átnevezhetjük a `Route` alatt létrejött függvényt és megadhatjuk, hogy melyik komponenst renderelje.   
Viszont, amiben különösen lenyűgöző a TanStack Router, hogy amikor egy `Link` komponensnél olyan útvonalat adunk meg, amely nem létezik, akkor a TypeScript fordítási hibát jelez. Mindez úgy lehetséges, hogy a dev szerver futása közben legenerálódik egy `routeTree.gen.ts` fájl, ami tartalmazni fogja a típusdefiníciókat.  

<br>

A TanStack Router másik nagy előnye, hogy lehetővé teszi, hogy adatokat kérjünk le még mielőtt az oldal renderelődne. Ez gyorsan elérhető adatok esetében jelentős felhasználóiélmény-javulást eredményezhet, mert a felhasználóknak kattintás után nem kell egy felvillanó betöltés komponenssel szembesülniük. A Router-t úgy írták meg, hogy szem előtt tartották a TanStack Query működését. Így van arra lehetőségünk, hogy a lekért adatokat ne a router gyorsítótárában, hanem a Tanstack Query gyorsítótárában tároljuk. Erre adok majd példát.

<br>

## TanStack Query

A TanStack Query egy régóta népszerű eszköz a szerver oldali állapotkezelésre. A lekérésekhez kulcsokat társít és opciókat, például, hogy mennyi ideig számít frissnek az adat. Beállíthatjuk végtelenre is, így az adott információt mindig a gyorsítótárból olvassuk be és csak akkor kérjük le újra, amikor invalidáljuk a kérdéses kulcsot. Ilyen eset lehet például egy mutáció, amikor új elemet hozunk létre és frissülnie kell például egy listának.

<br>

## Példa a kombinált használatra

Lássunk egy példát arra, hogy az adott linkhez társított oldalra navigálás előtt betöltjük az adatot a query cache-be. Pontosabban: ellenőrizzük, hogy létezik-e, és ha nem vagy nem friss, akkor lekérjük.
```
export const Route = createFileRoute('/main/posts/')({
  validateSearch: postsQuerySchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    take: search.take,
  }),
  loader: async ({ context, deps }) => {
    const queryString = new URLSearchParams({
      page: deps.page.toString(),
      take: deps.take.toString(),
    }).toString()

    // fetch the posts
    await context.queryClient.ensureQueryData(postsQueryOptions(queryString))

  },
  component: PostList,
})

function PostList() {
  return <PostListPage />
}
```
Nézzük az elemeket egyesével:
- __validateSearch__ : itt megadhatunk egy sémát, amit arra használ a router, hogy a keresési paraméterek típusát validálja. A népszerű validációs csomagok legfrissebb változataihoz adapter installálására sincs szükség (pl. Zod 4, Valibot 1.0, Arktype 2.0-rc)
- __loaderDeps__ : itt kell definiálnunk, hogy milyen függőségeket akarunk használni a következő loader metódusban. Szándékosan egyenként vannak felsorolva a paraméterek, hogy el lehessen kerülni, hogy fölösleges hívások menjenek ki olyan paraméterek változásaira, amelyek nem relevánsak az API-hívás szempontjából
- __loader__ : itt tudjuk elkérni az adatokat a backendtől
- __context__ : ha a `main.tsx` fájlban definiáltuk a queryClient-et contextus tulajdonságként, akkor itt elérhetővé válik. Ez a definiálás például a következőképpen nézhet ki:
```
// src/main.tsx
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})
```
- __ensureQueryData__ : ellenőrzi a query cache-t és indítja a hívást, ha nincs aktuális adat
- __postsQueryOptions__: ez nem eszköz függvény, csak kiemelem, hogy érdemes változóban tárolni az adott híváshoz tartozó kulcsot és opciókat, hogy azokat könnyedén újra fel tudjuk használni különböző fájlokban


<br>

Az oldal komponensében pedig a következőképpen férhetünk hozzá az adatokhoz:
```
const { data, error } = useSuspenseQuery(
    postsQueryOptions(queryString),
  )
```
vagy
```
const { data, error } = useQuery(
    postsQueryOptions(queryString),
  )

```

- __useSuspenseQuery__ : Suspense-kompatibilis query hook. A betöltési állapot kezelését React Suspense boundaryk végzik, ezért nincs szükség külön loading állapot kezelésére. SSR-rel kombinálva streamelhető is.
- __useQuery__ : klasszikus kliensoldali adatlekérésre használható hook.

<br>

## Mire figyeljünk?

Mivel népszerű és nyílt forráskódú eszközről van szó, vonzó célpontja lehet támadásoknak. Ilyen történt például május 11-én, amikor egy fertőzött verzió jelent meg az npm registryben, amely olyan kódot futtathatott letöltéskor, amely érzékeny adatok gyűjtésére volt képes.
Először az összes verziót megjelölték, ezért az én automatizmusom is bejelzett kritikus sérülékenységre. Szerencsére nem voltam érintett és így legalább utána tudtam nézni néhány kérdésnek.
Az ilyen támadásokat viszonylag hamar detektálják, ezért egy lehetséges védekezési mód, hogy a package managerünkben beállítjuk, hogy csak néhány napnál régebben frissített változatokat töltsünk le.
NPM esetében ez az .npmrc fájlban így néz ki:
```
min-release-age=3
```
PNPM esetében:
```
minimumReleaseAge: 4320 # 3 nap percben
```
Szintén hasznos lehet, hogy installáláskor használjuk az `--ignore-scripts` flag-et, ha olyasmit töltünk le, amiről tudjuk, hogy nem kell futtatnia semmit.