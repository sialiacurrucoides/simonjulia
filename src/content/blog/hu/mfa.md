---
title: "Több Faktoros Hitelesítés"
description: "Hitelesítés történhet az alapján, hogy mit tudunk, mivel rendelkezünk illetve, hogy mik vagyunk. Ha ezekből többet is igényel egy hitelesítés, akkor beszélünk több faktorról."
date: 2026-06-19
tags: ["frontend", "backend", "security"]
---
<figure class="diagram3">
  <img src="/mfa_hu.svg" alt="Hitelesítés három forrása" loading="lazy" />
</figure>

Többfaktoros hitelesítésről akkor beszélünk, ha legalább két különböző kategóriából származó faktort használunk.

<br>

## Miért lehet szükség több faktoros hitelesítésre?
A felhasználónév–jelszó pároson alapuló hitelesítés kijátszására a támadók ma már számos technikát alkalmaznak.

<br>

### Jelszó újrafelhasználás
Mivel az emberek nem szeretnek sok mindent észben tartani, ezért sajnos gyakran előfordul, hogy ugyanazt a jelszót használják különböző oldalakon. Ha azonban ezekből csak egyiket is olyan támadás éri, aminek következtében kiszivárognak az adatok, a támadók ezeket a publikussá vált hitelesítési adatokat végigpróbálhatják a különböző oldalakon (főleg, ha a jelszó nem volt megfelelőképpen titkosítva). A https://haveibeenpwned.com/ oldalon ellenőrizheted, hogy a regisztrációkhoz használt email címed hány adatszivárgásban szerepelt. 

<br>

### Gyenge jelszó
Gyakran használt és könnyen kitalálható jelszavakat automatikusan megpróbálhat a hacker és ha olyat használtál, megfelelő rate limit esetén is bejuthat a fiókodba. Gyenge rate limit mellett vagy kitartó munkával nem mindennapi, de rövid jelszavakat is végigpróbálhat egy algoritmus. Reza Zaheri szakértő Udemy kurzusában azt javasolja, hogy használjunk minimum 16 karaktert, mert annak a feltörése már akkora számítási kapacitást igényel, ami nem kivitelezhető. Természetesen változatos karakterekkel, mert 16 "a" betű vagy a "passwordpassword" is gyenge jelszavak. A https://www.security.org/how-secure-is-my-password/ oldalon játszhatsz azzal, hogy milyen hosszú és bonyolultságú jelszó mennyi időt igényel a feltöréshez.

<br>

### Társadalmi mérnökség (Social engineering)
Hiába az erős jelszó, ha a támadók rávesznek, hogy te magad add meg egy kamu oldalon, ami csak másolata annak, aminek hiszed. A támadás lehet emailben (phishing), sms-ben (smishing), hívással (vishing). Történhet makrón keresztül vagy a google-ben rossz linkre kattintással. Mindegyik célja, hogy adatokat adj meg. Ezen típusú csalással szemben a legtöbb hagyományos két faktoros megoldás (SMS, OTP) nem elegendő.

<br>

## Milyen hitelesítési opciók vannak és melyik mennyire hatékony?

<br>

### Jelszó
Erről ugye beszéltünk, itt csak egyetlen faktor van, hogy mit tudsz. Csak olyan alkalmazásoknál támaszkodjunk pusztán erre, ahol nincs semmilyen tét (pl. demo app).

<br>

### Jelszó + SMS
Ez a leggyengébb kombináció, bár még használatban van magas biztonságot igénylő alkalmazásoknál is. Itt a második faktor, hogy mivel rendelkezel: a telefonnal, amire az SMS érkezik. Sajnos az SMS-alapú hitelesítés gyengeségei közé tartozik az SS7 infrastruktúra örökölt sérülékenysége, valamint a SIM swap típusú támadások.  
Bevezetése jelentősen növeli a biztonságot egy önálló jelszóhoz képest, de ha már két faktoros hitelesítés, akkor érdemes egy erősebbet választani.

<br>

### Jelszó + kód emailben
Ez biztonsági szempontból az SMS-alapú megoldásokhoz hasonló kategóriába sorolható. Amikor emailben kapsz egy megerősítő kódot, az elméletileg egy második hitelesítési lépést jelent. A probléma az, hogy a kód ugyanabba az email-fiókba érkezik, amelyet a jelszó-visszaállításhoz is használnak. Ha egy támadó hozzáférést szerez ehhez az email-fiókhoz, gyakran minden szükséges információ a rendelkezésére áll a célfiók átvételéhez.  

Emiatt az emailes kódot sok szakértő gyengébb megoldásnak tartja, mint az authenticator alkalmazások vagy a passkey alapú hitelesítés. Ennek ellenére jelentős biztonsági előrelépést jelent a kizárólag jelszóra épülő bejelentkezéshez képest, ráadásul egyszerűen és olcsón implementálható. Olyan alkalmazások esetén, amelyek nem kezelnek különösen érzékeny adatokat, gyakorlati kompromisszum lehet.

<br>

### Jelszó + authentikátor applikáció
Ez tekinthető a klasszikus kétfaktoros hitelesítésnek. Lényege, hogy egy authentikátor applikáció (Authy, Google Authenticator, Microsoft Authenticator stb.) 30 másodpercenként generál egy kódot egy olyan kulcs alapján, amit beállításkor megkap a te alkalmazásodtól. A szervered és az authenticator ugyanazt a megosztott titkot használja. Az adott időpontot és titkot mindkettő ugyanúgy átalakítja, és az eredményt egy 6 karakter hosszú számként visszaadja. Ezt TOTP-nak nevezzük (Time-Based One-Time Password). Így aztán a két érték összevethető.
A TOTP már jelentősen megizzaszthatja a támadót, mert nem elég, hogy megszerezte a jelszót, a telefonodat is fel kell törnie, amit megintcsak jelkód véd. A social engineering ellen azonban nem hatásos, mert a támadók a kamu oldalon ugyanúgy bekérhetik ezt a kódot is, ahogy a jelszót és továbbítják a valós oldalra, ahova közben ők lépnek be. Például a banki alkalmazásba.

<br>

### Hardverkulcsok
A fizikai kulcsok, amelyek nélkül nem léphet tovább a hitelesítés. Ilyen a YubiKey, SoloKey, Titan Security Key. Sok biztonsági szakember még ma is ezt tekinti a legmagasabb védelmi szintnek. Azonban nem elhanyagolható az áruk, így nem számolhatunk ezekkel egy átlagos alkalmazás fejlesztésénél. Azonban a következő kategória is ehhez az ökoszisztémához tartozik és könnyen elérhető.

### Passkey + helyi felhasználóazonosítás
Ez jelenleg az iparági arany standard. A passkey már véd a phishing támadásoktól. Lényege, hogy rendelkezel egy privát és egy publikus kulccsal. A publikus kulcsot megkapja az alkalmazás backendje és eltárolja. Amikor a hitelesítés történik, küld egy véletlenszerűen generált kihívást (challenge-et) a frontendnek, hogy az küldje vissza titkosítva. A publikus kulcs segítségével le tudja ellenőrizni, hogy sikerült-e a kihívás vagyis a küldő rendelkezik-e a privát kulccsal. Ezt a kulcsot nem szerezheti meg a támadó anélkül, hogy az eszközt vagy a kulcsot őrző managert megszerezné, amihez kapcsolódik. Önmagában az eszköz birtoklása sem elég, hiszen a kulcs csak helyi felhasználóazonosítás (pl. biometrikus azonosítás, PIN) után használható.  
Feltételezem eszedbe jutott az SSH hitelesítés, ami logikájában egészen hasonló. A passkey abban más, hogy nem újrahasználható, hanem domainhez kötött és a felhasználónak nem kell terminált használnia, a frontend alkalmazás pillanatok alatt elvégzi a feladatát.  

<br>

## Tippek 2FA implementáláshoz (JS/TS környezetben)
Ha tutoriálokat nézünk, szinte biztos, hogy a Speakeasy csomag használatát mutatják be. Azonban ez a csomag nincs aktívan karban tartva, így célszerűbb inkább a __otpauth__ csomagot használni, ami frissebb és most már jelentősebb a felhasználói bázisa is. Ez a csomag teszi lehetővé a TOTP generálást a mi oldalunkon.  
Ha az alkalmazás mindennapi használattal jár, de nem tartalmaz kritikus adatokat, akkor a felhasználói élmény érdekében érdemes lehet lehetővé tenni, hogy megjegyezzük az eszközt és csak akkor történjen a második lépés triggerelése, ha a felhasználó egy másik eszközről akar bejelentkezni vagy eltelt egy hosszabb időszak. A bypass beállítást tárolhatjuk egy httpOnly sütiben.  
Validáljunk arra, hogy egy kódot egyszer lehessen authentikációra felhasználni, függetlenül attól, hogy az authentikátorban még aktív.  

### Helyreállítási kódok

A kétfaktoros hitelesítés bevezetésével mindig biztosítani kell egy biztonságos helyreállítási folyamatot. Ennek legelterjedtebb módja az egyszer használható recovery kódok biztosítása, amelyeket a felhasználó offline eltárolhat.

<br>

## Tippek passkey implementálásához (node környezetben)
Node backend esetében népszerű megoldás a __WebAuthn__ szabvány használata. Ennek implementálására gyakran választják az @simplewebauthn/server csomagot, amely biztosítja a regisztráció és hitelesítés során használt challenge–response folyamat kezelését.

A felhasználók számára érdemes lehetővé tenni több passkey regisztrálását is ugyanahhoz a fiókhoz. Bár a passkey-k gyakran egy adott eszközön jönnek létre, sok platform automatikusan szinkronizálja őket a felhasználó eszközei között (például iCloud Keychain vagy Google Password Manager segítségével). Emellett előfordulhat, hogy a felhasználó külön munkahelyi és személyes eszközről is szeretne bejelentkezni.

Érdemes gondoskodni helyreállítási lehetőségről is arra az esetre, ha a felhasználó elveszítené az összes regisztrált eszközét vagy passkey-jét. Ez történhet például recovery kódokkal, alternatív hitelesítési módszerrel vagy ügyfélszolgálati folyamaton keresztül.

<br>

## Konklúzió

Mi mitől véd?
| Módszer            | Brute force&nbsp;  &nbsp;| Adatszivárgás&nbsp;  &nbsp;| Phishing&nbsp; &nbsp;|
| ------------------ | -----------------        | -------------------        | -------------- |
| Jelszó             | ⚠️                       | ❌                          | ❌             |
| SMS                | ✅                       | ✅                          | ❌             |
| Email OTP          | ✅                       | ✅                          | ❌             |
| TOTP               | ✅                       | ✅                          | ❌             |
| Passkey/WebAuthn &nbsp;   | ✅                | ✅                          | ✅             |

<br>

Izgalmas idő előtt állunk, ami azzal az ígérettel kecsegtet, hogy nem kell többet jelszavak miatt aggódnunk. A Passkey lehetősége lelkesíti a szakembereket, de az átmenet még közel sem gyors. Ezért érdemes tisztában lennünk a különböző megoldások előnyeivel és hátrányaival. Sok olyan részlet van, ami miatt a tanulást nem érdemes abbahagyni.