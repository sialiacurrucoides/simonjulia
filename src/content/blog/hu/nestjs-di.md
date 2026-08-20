---
title: "NestJS Függőséginjektálás"
description: "A NestJS nagy előnye, hogy egy jól meghatározott struktúrát biztosít a backendünkhöz. Az átláthatóság és hatékonyság biztosításának egyik kiemelt eszköze a függőség injektálás. Ez azt jelenti, hogy nem szükséges a felhasználás helyén inicializálni egy függőséget, elég jelezni, hogy kell, és a NestJS biztosítja annak elérhetőségét."
date: 2026-08-20
tags: ["backend"]
---

<figure class="diagram3">
  <img src="/nestjs_cook.webp" alt="A NestJS feliratú szakács egy UserService feliratú edényt önt a DI Container feliratú üstbe, miközben a TypeScript metaadat-receptkönyvet olvassa, és a UserController csenget érte" width="1536" height="1024" loading="lazy" />
  <figcaption>A NestJS függőséginjektálása, konyhai stílusban</figcaption>
</figure>

<br>

## Mit jelent a függőséginjektálás (dependency injection, DI) a gyakorlatban?

Ha egy osztály nem támaszkodna a NestJS DI-jére, hogy az elérhetővé tegye számára a függőségeit, akkor valahogy így nézne ki a kód:
```
class UserController {
    constructor() {
        const config = new Config();
        const database = new Database(config);
        const userRepository = new UserRepository(database);

        this.userService = new UserService(userRepository)
    }
}
```

<br>

Ehhez képest, csak jeleznünk kell, hogy mit szeretnénk használni:
```
class UserController {
    constructor(private userService: UserService) {}
}
```

Nem kell mindenhol nekünk felépíteni a teljes függőségi láncot.

<br>

## Mi történik a színfalak mögött?

Fordításkor a típusdefiníciók kikerülnek a kódból, de ha a TypeScript konfigurációs fájljában szerepel a 
```
    "emitDecoratorMetadata": true,
```
, akkor a metaadatok megmaradnak és felhasználhatóak arra, hogy a kódban maradjon az az információ, hogy melyik osztálynak milyen más osztályokra van szüksége. Erre támaszkodhat az algoritmus, azon felül, hogy milyen providerek kerültek regisztálásra és, hogy milyen tokeneket definiáltunk.

<br>

A NestJS a modulban megadott providereket összegyűjti, regisztrálja a DI-konténerben, majd a függőségek feloldásakor létrehozza és kezeli a szükséges példányokat. A metaadatok alapján fel tudja építeni a __függőségi gráfot__, hogy mely kódrészletnek melyik providerekre van szüksége. Alapértelmezett módon egy-egy, újrafelhasználható _instance_ jön létre, amelyet a NestJS cache-el.

<br>

Teljesítmény szempontjából teljesen érthető, hogy a singleton scope az alapértelmezett mód, de lehetőség van felülírni REQUEST szintű vagy TRANSIENT scope-ra. Ez utóbbi esetben a transient provider nincs megosztva a fogyasztók között, hanem az egyes fogyasztók külön instance-t kapnak. A REQUEST scope esetén minden beérkező kéréshez új instance jön létre.


<br>

Az injektálás maga egy rekurzív folyamat, melynek során végigmegy az algoritmus a függőségek függőségein és felépíti a szükséges kódot:
```
    resolve(A)

    A requires B
        ↓
    resolve(B)

    B requires C
        ↓
    resolve(C)

    C requires nothing
        ↓
    create C

    create B(C)

    create A(B)
```

<br>

## Körkörös függőség

A fenti logikából következik a kérdés, hogy mi történik akkor, ha A függ B-től és B függ A-tól. Hoppá... Bár célszerű kerülni az ilyesmit, például a közös elemek külön modulba szervezésével, vannak indokolható előfordulási esetek. Ilyenkor a megoldás a _forwardRef()_.
```
constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
```
<br>

```
constructor(
    @Inject(forwardRef(() => CatService))
    private catService: CatService,
  ) {}
```

Ebben az esetben az algoritmus későbbre halaszthatja a hivatkozott osztály feloldását, akár addig, amíg a teljes gráf felépül.

<br>

Modulok esetében szintén előfordulhat kölcsönös függőség, amikor _forwardRef()_ alkalmazására van szükség.
```
// CommonModule
@Module({ imports: [forwardRef(() => CatsModule)] })
export class CommonModule {}

```

<br>

```

// CatsModule
@Module({ imports: [forwardRef(() => CommonModule)] })
export class CatsModule {}

```

<br>

## Mi mindent lehet injektálni?

Injektálni nem csak egy másik osztályt lehet, hanem változókat, vagy más providerektől függő, futásidőben számított értékeket is. Lássunk néhány példát.
Konstansok:
```
    const catConfig = {
        color: 'black',
        strength: 'strong',
    };

    @Module({
        providers: [
            {
            provide: 'CAT_CONFIG',
            useValue: catConfig,
            },
        ],
    })
```
<br>

Vegyük észre, hogy kapott egy nevet a providerünk. Ez lesz az azonosító __token__, amely alapján a NestJS később megtalálja és feloldja a providert. A gyakran használt, egysoros provider megadás egy egyszerűsítés, ekvivalens a következővel:
```
{
    provide: CatsService,
    useClass: CatsService,
},
```

<br>

Ha a providerhez osztály helyett például stringet vagy Symbol-t használunk injection tokenként, akkor az injektáláskor az @Inject() dekorátorral kell megadnunk a tokent.
```
    @Injectable()
    export class CatSalon {
        constructor(@Inject('CAT_CONFIG') private config) {}
    }
```

<br>

Paraméterfüggő értékek.
```
    @Module({
        providers: [
            {
            provide: 'CAT_MOOD',
            useFactory: () => {
                const hour = new Date().getHours();
                return hour < 16 ? 'Calm Cat' : 'Impatient cat';
            },
            },
        ],
    })
```
Egy tipikus példa lehet a konfigurációfüggő adatbázis kapcsolatot biztosító provider.
```
{
  provide: 'CONNECTION',
  useFactory: (config: ConfigService) => new DatabaseConnection(config.get('DB_URL')),
  inject: [ConfigService],
}
```
Ebben az esetben az argumentum is injektálva van.

<br>

## Mi a feltétele az injektálás működésének?

- __@Injectable()__ dekorátorral látjuk el azokat az osztályokat, amelyek a függőséginjektálási rendszerben részt vehetnek.
- A modul fájlban a providers kulcs alatt felsoroljuk az összes providert, amelyeket az adott modul DI-konténere kezelhet, mert itt fogja a NestJS algoritmusa ellenőrizni, hogy mit kell az adott konténerben regisztrálni.
- Ha másik modul szeretné használni az adott providert, akkor a providert tartalmazó modulnak hozzá kell adnia az _exports_ listához a __providert__, a befogadó modulnak pedig meg kell nevezni az exportáló __modult__ az _imports_ listában.
- Nem mindegy a fordító, mert fontos a futási időben elérhető metaadatok megtartása. Támogatott például a tsc vagy az SWC megfelelő konfigurációval.

<br>

## Konklúzió

A függőséginjektálásnak köszönhetően átláthatóbb kódbázist kapunk és az alapvető logika megértésével könnyen felépíthetjük a moduljainkat, javíthatjuk a függőséginjektálással kapcsolatos hibákat. Például amikor elfelejtünk exportálni valamit (ha épp olyan kedvünkben voltunk, hogy kézzel írtuk a kódot 🙂 ).