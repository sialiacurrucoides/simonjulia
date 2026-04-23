---
title: "Drizzle ORM"
description: "Az adatbázissal való kommunikációt minimális absztrakcióval és mégis típusbiztonsággal lehetővé tevő, gyorsaságra optimalizált ORM."
date: 2026-04-23
tags: ["backend", "db"]
---
Az ORM (Object-Relational Mapping, azaz objektum-relációs leképzés) egy olyan eszköz, lehetővé teszi az általunk használt programozási nyelv objektumai és az adatbázis táblák közötti leképezést, valamint a lekérdezések absztrahálását. Számos ORM létezik, amelyek eltérnek például abban, hogy milyen szintű absztrakciót használnak. Az egyik igen népszerű ORM a Prisma, amely már kevésbé emlékeztet az SQL-re. Célja, hogy megkönnyítse és felgyorsítsa a fejlesztési folyamatot. Hozzá képest a Drizzle a skála másik végén található, hiszen csak egy nagyon vékony réteget épít az SQL fölé és az a filozófiája, hogy ha ismered az SQL-t, akkor a Drizzle használata is ismerős lesz. Cserébe viszont kifejezetten jó teljesítményt tud nyújtani és csökkenti a "black-box" élményt, amiről be kell vallanom, hogy nagyon tetszik. 😊

<br>

## A sokféleség ORM-je
Rugalmasság és optimalizáció szempontjából előny, elindulás és belépési kompetencia szempontjából valószínűleg hátrány, hogy több területen is sok választási lehetőséget ad.
- Adott adatbázishoz kiválaszthatjuk, hogy melyik __drivert__ szeretnénk használni. Mivel natív driverekkel dolgozik, nagyon könnyen tud támogatást biztosítani újabb relációs adatbázis típusoknak.
- Kiválaszthatjuk a __migrációs stratégiát__. A Drizzle csapata elérhetővé tette a _drizzle-kit_ CLI-t, ami segít a migrációk kezelésében. Választhatjuk azt a stratégiát, hogy megadjuk a config objektumban a migrációk célmappáját és a __generate__ paranccsal oda generálja a migrálandó SQL-t. Azokat pedig a __migrate__ paranccsal az applikáció indulásakor futtathatunk, hogy ha történt új változás, akkor azt alkalmazza az adatbázisunkra. Ennek a stratégiának kritikája lehet, hogy amikor több fejlesztő dolgozik egyszerre, akkor a migrációk úgyis összeakadhatnak, hogy nincs _merge conflict_ a PR-ok esetében. Ezért van aki a másik stratégiát javasolja, hogy a definiált séma alapján __push__ parancs segítségével frissítsük az adatbázisunkat.
- Választhatunk, hogy milyen stratégiával szeretnénk komplex lekérdezéseket futtatni. Ha kisujjunkban van az összes join meg egyéb SQL parancs, akkor felépíthetünk mindent úgy, mint ahogy az SQL-lel tennénk, csak típusbiztonsággal. Viszont ha sok táblát kell összekapcsolni érdemes lehet a __query__ API-t választani a lekérdezésekhez, amely elérhetővé tesz egy _findMany_ és egy _findFirst_ metódust. Ezek magasabb absztrakciót jelentenek és elég egy _with_ attribútumnak megadni, hogy melyik táblának az értékeit szeretnénk még hozzácsatolni a lekérdezésünkhöz. Az eredmény itt is gyors lesz, mert ígéretük szerint általában mindig __egyetlen query__ fog lefutni. Ezen api használatához viszont a séma definíció után a relációkat is explicit módon definiálni kell. (Megjegyzés: a relációk definiálása, csak a fejlesztői élményt szolgálja, a táblák közti restriktív kapcsolatokért az idegen kulcsok megadás a felelős, amit a _references_ metódus segítségével tehetünk meg.)

<br>

## Drizzle használata

Itt nincs egy varázs "init" parancs, ami a "battery included" élményt biztosítaná, rá kell szánni egy kis időt, hogy megírjuk a konfigurációkat. Az elindulás nem annyira magától értetődő, de utána a részletekről nagyon jó a dokumentáció. 
```
import type { Config } from 'drizzle-kit';

export default {
    // open ended so different schemas can be in different files
    schema: './src/database/schema/**/*',
    // destination of the migration files, here is different than in the docs
    out: './src/database/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env['DATABASE_URL']!,
    },
} satisfies Config;
```

<br>

Ha valakinek segítség lehet az elindulásban, mutatok egy példát Nestjs applikációban való használatra. Biztosan találni ennél jobb megoldásokat, de legalább lássunk egy példát, ami egy fokkal komplexebb, mint a dokumentációban leírtak. Nestjs esetében érdemes lehet egy külön Drizzle modult létrehozni, amely exportál egy DrizzleService-t.
```
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { PG_CONNECTION, PG_POOL } from './drizzle.provider';
import type { Schema } from './schema/schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  readonly db: NodePgDatabase<Schema>;

  constructor(
    @Inject(PG_CONNECTION) db: NodePgDatabase<Schema>,
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {
    this.db = db;
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
    } catch (err) {
      console.warn('Drizzle pool shutdown failed:', err);
    }
  }
}
```

<br>

A _schema_ file a _schema_ mappában összegyűjti a különböző fájlokban definiált sémákat.
```
import { sessions } from './session.entity';
import { users } from './user.entity';

export const schema = {
    users,
    sessions,
};
export type Schema = typeof schema;
export type SchemaName = keyof Schema;
``` 
Amelyik sémát itt nem soroljuk fel, azt nem fogja látni a query API.  

<br>

A Provider pedig a következőképpen épülhet fel:
```
import { PreconditionFailedException, type Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ERROR_CODES, ERROR_MESSAGES } from '@/common';

export const PG_CONNECTION = 'PG_CONNECTION';
export const PG_POOL = 'PG_POOL';

export const DrizzleProvider: Provider[] = [
  {
    provide: PG_POOL,
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      const connectionString = configService.get<string>('database.url');

      if (!connectionString) {
        throw new PreconditionFailedException();
      }

      return new Pool({
        connectionString,
      });
    },
  },
  {
    provide: PG_CONNECTION,
    inject: [PG_POOL],
    useFactory(pool: Pool) {
      const loggerEnabled = process.env['NODE_ENV'] !== 'production';

      return drizzle(pool, {
        schema,
        logger: loggerEnabled,
        casing: 'snake_case',
      });
    },
  },
];
```

<br>

Ezután definiálhatjuk a sémákat, azok relációit, ha szeretnénk használni a query API-t, illetve exportálhatjuk a számunkra hasznos típusokat.
```
import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import {
  pgTable,
  varchar,
  serial,
  text,
  integer,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { post } from './post.entity';
import { timestamps } from './timestamps.entity';
import { users } from './user.entity';

export const postTag = pgTable(
  'post_tag', // column name in the database, snake case is preferred
  {
    // autoincrementing
    id: serial('id').primaryKey(),
    // can specify the max number of characters
    name: varchar('name', { length: 24 }).notNull(),
    userId: text('user_id')
      // what should happen if the related table row gets deleted
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    // included the created_at and updated_at columns, a reusable entity
    ...timestamps,
  },
  (table) => [
    // define custom indexes
    // the name should be unique in the rows that belong to a given user
    uniqueIndex('post_tag_user_unique').on(table.userId, table.name), 
  ],
);

// a join table
export const tagToPost = pgTable(
  'post_tag_to_post',
  {
    postTagId: integer('post_tag_id')
      .notNull()
      .references(() => postTag.id, { onDelete: 'cascade' }),
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postTagId, t.postId] })],
);

// define the relations to use via query API
export const tagToPostRelations = relations(tagToPost, ({ one }) => ({
  postTag: one(postTag, {
    fields: [tagToPost.postTagId],
    references: [postTag.id],
  }),
  post: one(post, {
    fields: [tagToPost.postId],
    references: [post.id],
  }),
}));

// reverse relations also
export const postTagRelations = relations(postTag, ({ many }) => ({
  tagLinks: many(tagToPost),
}));

export type PostTag = InferSelectModel<typeof postTag>;
export type NewPostTag = InferInsertModel<typeof postTag>;

```

<br>

Mostmár könnyedén visszakaphatjuk az adatokat. SQL-szerű szintaxissal:
```
 async findAll(
    data: GetTagsDto,
    db: typeof this.drizzle.db = this.drizzle.db,
  ): Promise<Array<Pick<PostTag, 'id' | 'name'>>> {

    return db
      // avoid selecting everything, you do not know how the table will inflate
      .select({ name: postTag.name, id: postTag.id })
      .from(postTag)
      .where(
          eq(postTag.userId, data.userId),
      );
  }
```

<br>

vagy a query API segítségével, ha kapcsolt táblák adatait is könnyen szeretnénk elérni:
```
 async findAllPostsWithComments(
    data: GetPostsDto,
    db: typeof this.drizzle.db = this.drizzle.db,
  ): Promise<Array<Pick<Post, 'id' | 'text'>>> {

    return db.query.postTag.findMany({
      where: data.filters,
      with: {
        // not defined in the above example, but if posts have comment relations
        comment: true
      },
      columns: {
        id: true,
        text: true
      },
      orderBy: [desc(post.createdAt), desc(post.id)],
      limit: data.take,
      offset: calcOffset(data.page, data.take),
    });
  }
```

<br>

Több kapcsolódó kérés esetében pedig használhatunk tranzakciót.
```
await db.transaction(async (tx) => {
  // multiple operations
});
```

<br>

## Esetleges kényelmetlenségek, ellenérvek

- Telepítéskor jelenleg még 1.0 alatti verziót kapunk, amihez a dokumentációban az _[OLD] Query_ és az _[OLD] Drizzle relations_ rész tartozik. Jó szem előtt tartani mielőtt összekeveredünk a szintaxissal. Létezik az 1-es verzió, de az még béta. Ettől függetlenül a Drizzle már használható éles applikációkhoz.
- A kiegészítő eszközök még nem annyira széleskörűek és erősek, mint például a Prisma esetében. Hiába az erős tsconfig, az eslint szabályok az _eslint-plugin-drizzle_-el, futottam bele olyan migrációs hibákba, amiket egy jó intellicence könnyen jelezhetett volna.
- Ha kezdőkkel is dolgozik egy csapat, akik nem annyira erősek SQL-ben, akkor egy magasabb absztracióval rendelkező ORM-el gyorsabb lehet a munka.
- Az AI jelenleg kevesebb tudással rendelkezik róla, mivel kevesebb oktató anyag érhető vele kapcsolatban, így könnyen előfordul, hogy nem megfelelő szintaxissal ad példát vagy nem tud egy jellemzőről, amivel már rendelkezik a Drizzle.
- A query API nem fed le minden lekérdezés variációt. Egyes specifikusabb filterek miatt vissza kell térnünk az SQL-szerű szintaxishoz, így vegyessé válik a stratégiánk.

<br>

## Konklúzió
Amennyiben preferáljuk a nagyobb kontrollt és ha nem is teljeskörű a tudásunk, de célunk, hogy jobban rálássunk az adatbázissal való interakciókra, akkor én mindenképp tudom javasolni a Drizzle kipróbálását. Tapasztaltabb fejlesztők pedig profitálhatnak az általa nyújtott teljesítmény előnyökből. Valószínűleg ezt támasztja alá az is, hogy 2026-ban az npm letöltések száma meredeken emelkedik.