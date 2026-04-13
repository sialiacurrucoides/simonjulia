---
title: "Git hooks"
description: "A Git hookok lehetővé teszik egyedi kódok futtatását a különböző Git parancsok végrehajtása előtt vagy után. Automatizálható a segítségükkel sok olyan ellenőrzés, amit a fejlesztőnek kellene észben tartania."
date: 2026-04-13
tags: ["backend", "frontend", "security", "DevOps"]
---
## Hook-ok

Inicializálva egy git projektet, kapunk egy `hooks` mappát a `.git` mappában, benne példa kódokkal.
```
    applypatch-msg.sample           pre-push.sample
    commit-msg.sample               pre-rebase.sample
    fsmonitor-watchman.sample       pre-receive.sample
    post-update.sample              prepare-commit-msg.sample
    pre-applypatch.sample           push-to-checkout.sample
    pre-commit.sample               sendemail-validate.sample
    pre-merge-commit.sample         update.sample
```

<br>

Ezek különböző lépések előtt lefuttatandó kódokat tartalmaznak, melyek közül talán a legismertebb a _pre-commit_ hook. 
Ha kitöröljük a sample végződést és végrehajthatóvá tesszük a kódot (`chmod ug+x`), akkor ki is próbálhatjuk ezeket.

<br>

## Hook kezelő segéd eszközök

Az általános gyakorlatban, kifejezetten amikor több fejlesztő van a projekten, nem kézzel módosítjuk ezeket a fájlokat. Az esetek többségében valamilyen segédeszközt használunk, amely megkönnyíti a hookok kezelését, megosztását és verziózását. A Git hookok alapértelmezés szerint nem részei a repository-nak, ezért nem osztódnak meg automatikusan a csapat tagjai között. Ez az egyik fő oka annak, hogy hook kezelő eszközöket használunk.  
Python közösségek elsősorban a __pre-commit framework__-öt használják, a javascriptes közösségek inkább a __husky__-t.  
Természetesen a pre-commit is használható JS alapú projekten és előnye, hogy sok előre elkészített scriptet tesz elérhetővé. Azonban ha az a cél, hogy egy új fejlesztő ismerősnek érezzen egy TypeScript projektet, akkor érdemes a husky-t választani.

<br>

## Mire jók, mikor érdemes használni őket?

### pre-commit
Szélsőséges véleményeket lehet hallani, hogy érdemes-e egyáltalán például _pre-commit_ hook-ot használni. Fő kritika szokott lenni, hogy megakasztja a fejlesztői folyamatot, túl hosszú lehet és nem is biztonságos, hiszen bármikor kikerülhető a `--no-verify` paranccsal. Ebben van igazság, és amikor tehetjük mindeképpen támaszkodjunk a __CI__-ra mind munkavégzés, mind ellenőrzés szempontjából. A hookok nem helyettesítik a CI ellenőrzéseket, csak kiegészítik azokat.  
Van azonban pár lépés, amit jobb a fejlesztői gépen is lefuttatni, még mielőtt bekerül a kód a git history-ba. Ilyen például, hogy ellenőrizzük, nem hagytunk a kódban egy titoknak minősülő változót. Nem feltétlen butaságból, lehet debugolás során beírtuk és elfeledkeztünk róla. A titkok keresésére ingyenesen elérhető például a __ggshield__ amelyet érdemes még a commit elkészülte előtt lefuttatni, így nem kell git akrobatika, ha el akarjuk tüntetni a nyomait. Ehhez persze minden fejlesztőnek le kell töltenie a GitGuardian ggshield programját, és bejelentkeznie. Ezután azonban már csak egy sort kell hozzáadnunk a legenerált pre-commit filehoz: `ggshield secret scan pre-commit`. A szkennelés történhet lokálisan is, így minimalizálható az adatküldés.
Szintén ennél a hook-nál érdemes a lint-et is futtatni. Ha a teljes lint-et futtatnánk, akkor egy későbbi fázisba tenném, de mivel általában elegendő mindig csak a változtatott fájlokra futtatni az ellenőrzést, ezért a __lint-staged__ csomagot szoktuk használni. A lint-staged pedig a staging area-ba került fájlokon futtatja az ellenőrzéseket.

### pre-push
Ha nem áll rendelkezésünkre CI idő a tesztek futtatására, akkor itt lehet érdemes a __teszteket__ és a __lefedettség__ ellenőrzést futtatni. Tartsuk szem előtt, hogy minél nagyobb a projekt annál lassabbá válik a folyamat, így csak végső esetben használjuk erre a fejlesztő gépét és idejét. A kódbázisba való bekerülés előtt érdemes megtudni, hogy eltörtünk-e valamit illetve, hogy lefedtük-e tesztekkel a kódot a projekt számára elvárt mértékben. Pre-commit esetében azért nem javaslom, mert célszerű, ha kis teljes egységekből commit készül és logikailag elkülönülnek, például a feature és a test két külön commit, amit a __conventional commit__ nevezéktan is előirányoz. (Ez utóbbi irányelveit a _commit-msg_-ben tehetjük kötelezővé).
Ugyancsak ennél a lépésnél nézném meg, hogy hagytunk-e a kódban fölösleges __logokat__. Időveszteséget jelenthet, amikor arra megy el egy kör review, hogy ezeket takarítsuk ki.

Ha szeretnénk mindig naprakészek lenni, hogy kiderült-e valamilyen komoly sérülékenység valamelyik általunk használt csomagról, akkor automatizálhatjuk a __`npm audit`__ futtatását is valamelyik hook-ban. 

<br>
Számos különböző feltételt megfogalmazhatunk, hogy mit szeretnénk elkerülni, hogy bekerüljön a publikálandó kódba. Nincs más dolgunk, mint egy script részlettel kiegészíteni a szóban forgó hook fájlokat és nem zéró értéket adni az exit parancsnak, ha egy feltétel nem teljesült. A hookoknak azonban érdems gyorsnak lenniük. Ha egy ellenőrzés több másodpercig vagy percig tart, érdemes inkább CI-be helyezni.”

<br>
Boldog és biztonságos kódolást kívánok!
