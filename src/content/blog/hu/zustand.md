---
title: "Zustand"
description: "A kliens oldali állapotkezelést könnyűvé és hatékonnyá lehet tenni a Zustand állapotkezelő segítségével."
date: 2026-05-29
tags: ["frontend"]
---
## Mikor használjuk?

Az igazság az, hogy nincs mindig szükség egy külső könyvtárra a kliens oldali állapotkezeléshez. Bár a Zustand React-től függetlenül is használható, most a React ökoszisztémából hozok példát. Ha egy egyszerűbb applikációról van szó vagy csak kevés a kliens oldali logika, mert minden a backendről jön, könnyen lehet, hogy elégséges a React által biztosított:
- Context API a globális állapot kezeléséhez (pl.: ThemeProvider)
- useState az egyszerű lokális állapothoz, amit csak egyetlen komponens használ
- useReducer összetettebb lokális állapot kezelésére
- Context API + useReducer megosztott globális állapothoz

<br>

Azonban, ahogy egyre több értéket kell nyomon követni, a Context alapú stratégia könnyen vezethet teljesítményromláshoz. Ennek oka, hogy amikor változik a context provider értéke, akkor minden olyan komponens újrarenderelődik, amely használja az adott contextet.
A modern állapot managerek, így például a Zustand nagy előnye, hogy lehetővé teszik, hogy a tárolt állapotnak akár csak egyetlen tulajdonságára "iratkozzon fel" az adott komponens és csak akkor renderelődik újra, ha az az egy tulajdonság változik.

<br>

Historikusan a Redux a leginkább ismert állapotkezelő, amit nagyon nagy projekteknél még mindig célszerű lehet használni, amikor egy nagy és könnyen változó fejlesztői gárdának egy jól meghatározott rendszert akarunk biztosítani. Azonban a Redux egyik fő hátránya, hogy sok "boilerplate" kóddal jár. Ezt a problémát küszöböli ki a Zustand, amelynek egészen egyszerű a szintaxisa.

<br>

## Zustand használata

A Zustand esetében először is definiálunk egy _store_-t.  
```
import { create } from 'zustand'

const useBear = create((set) => ({
  bears: 0,
  actions: {
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears) => set({ bears: newBears }),
  }
}))
```
Figyeljük meg, hogy a klasszikus React stratégiához képest, nem kell kézzel összeolvasztanunk a régi és az új állapotot, csak azt kell megadnunk, amit változtatunk és a Zustand elvégzi az összevonást. Azonban ez csak az állapot objektum felső rétegére igaz, egymásba ágyazott objektumoknál újra nekünk kell a régit és az újat összevonni.
```
    setAddress: () => set((state) => ({
    user: {
        ...state.user,
        address: {
        ...state.user.address,
        address: 'My new address'
        }
    }
    }))
```
Ha sok ilyen állapotunk van, segítségül hívhatjuk az __immer__ eszközt, amit külön installálni kell.

<br>

### create vs createStore
Használhatjuk a __create__ vagy a __createStore__ függvényeket a store létrehozására. A különbség az, hogy a _create_ React-re van optimizálva és lényegében egy hook-ot ad vissza, amin elérhetők a store metódusok (getState, setState, subscribe). Ennek köszönhetően, a komponens újra renderelődik, ha változik a releváns állapot. A _createStore_ viszont egy frameworkfüggetlen store objektumot hoz létre, aminek az esetében nekünk kell gondoskodni a megfelelő integrációról. Viszont használható pl. SSR stratégiánál.
Mind a két függvényre igaz, hogy használhatóak React komponensen kívül is, ami segíti a letisztultabb komponensek kialakítását.  
```
import { useChatStore } from './chatStore'

const socket = new WebSocket('wss://example.com/chat')

socket.addEventListener('open', () => {
  useChatStore.getState().setConnected(true)
})
```

<br>

### Tárolt változók használata
A komponensekben való használatakor szem előtt kell tartanunk, hogy a Zustand a selector visszatérési értékének referenciáját összehasonlítja az új érték referenciájával és különbség esetén a komponens újrarenderelődik. Ennek fényében lássunk néhány jó és néhány rossz példát.
```
// GOOD
const counter = useMyStore((s) => s.counter)
const selectedColor = useMyStore((s) => s.selectedColor)
const actions = useMyStore((s) => s.actions) // even if actions an object, the reference did not change

// BAD
const { counter, selectedColor } = useMyStore((s) => ({
    counter: s.counter,
    selectedColor: s.selectedColor
})) // object reference changes
const { actions } = useMyStore() // rerenders on every store change
```

<br>

### useShallow
Amikor sok primitív változónk van, soknak érződik mindent egyenként kinyerni. Ilyenkor használhatjuk a _useShallow_ hook-ot. Arra figyeljünk, hogy az összehasonlítás csak a legfelső szinten történik.
```
const names = useBearFamilyMealsStore(
    useShallow((state) => Object.keys(state)),
  )
```

<br>

### Middlewarek
Vannak kész middlewarek, amelyeket adott problémára tudunk használni (devtools, immer, combine...). Ilyen például a __persist__, aminek a segítségével mindent menthetünk _localstorage_-ba is.
```
const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)
```
Vegyük észre, hogy van egy plusz függvényhívás a típus definiálás után (currying). Ez minden middleware alkalmazásnál szükséges, akkor is, amikor sajátot hozunk létre. Ez teszi lehetővé az egymásba ágyazott objektumok típusainak a kikövetkeztetését.

<br>

### Összegzés

A Zustand szerintem méltán örvend egyre növekvő népszerűségnek. Használata gyorsan megtanulható és ha odafigyelünk csak néhány alapelvre, akkor segít hatékonyabbá tenni az applikációnkat.