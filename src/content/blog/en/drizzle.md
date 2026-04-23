---
title: "Drizzle ORM"
description: "A performance-oriented ORM that enables database communication with minimal abstraction while maintaining type safety."
date: 2026-04-23
tags: ["backend", "db"]
---
An ORM (Object-Relational Mapping) is a tool that enables mapping between the objects used in a programming language and database tables, as well as abstracting database queries. There are many ORMs available, differing for example in the level of abstraction they provide. One very popular ORM is Prisma, which uses a syntax that differs significantly from SQL. Its goal is to simplify and speed up the development process.  

In contrast, Drizzle sits at the other end of the spectrum, as it builds only a very thin layer on top of SQL. Its philosophy is that if you know SQL, using Drizzle will feel familiar. In return, it can provide excellent performance and reduces the “black-box” feeling — which, I have to admit, I really like. 😊

<br>

## The ORM of flexibility

From the perspective of flexibility and optimization, it’s an advantage — but from the perspective of getting started and required entry-level knowledge, it can be a disadvantage — that it offers many choices across several areas.

- For a given database, we can choose which __driver__ to use. Since it works with native drivers, it can easily support newer relational database types.
- We can choose a __migration strategy__. The Drizzle team provides the _drizzle-kit_ CLI, which helps manage migrations. One approach is to define the output directory for migrations in the config object and use the __generate__ command to create the SQL migration files. These can then be executed with the __migrate__ command when the application starts, applying any new changes to the database.  

  A common criticism of this approach is that when multiple developers work simultaneously, migrations can conflict even without merge conflicts in pull requests. For this reason, some prefer the alternative approach: updating the database using the __push__ command based on the defined schema.
- We can also choose how to handle complex queries. If we are very comfortable with SQL (joins and other constructs), we can build everything similarly to how we would in SQL, but with type safety. However, when working with multiple related tables, it may be worth using the __query__ API, which provides _findMany_ and _findFirst_ methods.  

  These represent a higher level of abstraction, where it’s enough to specify related tables via a _with_ attribute. The result is still performant, as it typically executes a __single query__.  

  However, to use this API, relations must be explicitly defined after defining the schema.  
  *(Note: defining relations mainly serves developer experience, while actual constraints between tables are enforced via foreign keys, defined using the _references_ method.)*

<br>

## Using Drizzle

There is no magic “init” command that provides a “batteries included” experience — you need to spend some time setting up the configuration. Getting started is not entirely straightforward, but the documentation is excellent when it comes to other details.

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
<figcaption>Konfigurációs fájl a gyökér mappában</figcaption>

<br>

If it helps with getting started, here’s an example of using Drizzle in a NestJS application. There are certainly better solutions out there, but this gives a slightly more complex example than what’s shown in the documentation.  
In NestJS, it can be useful to create a dedicated Drizzle module that exports a DrizzleService.
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

The schema file collects schemas defined across different files within the schema directory.
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
Any schema not listed here will not be visible to the query API.

<br>

The provider can be implemented as follows:
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

After that, we can define schemas, their relations (if we want to use the query API), and export useful types.
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

We can now easily retrieve data using SQL-like syntax:
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
Or using the query API, if we want to conveniently access related data:

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

In the case of multiple related requests, we can use a transaction.
```
await db.transaction(async (tx) => {
  // multiple operations
});
```

<br>

## Potential drawbacks
- At the time of writing, the installed version is still below 1.0, and some parts of the relevant documentation to that version are labeled _[OLD] Query_ and _[OLD] Drizzle relations_. It’s worth keeping this in mind to avoid confusion. A 1.0 version exists but is still in beta. Despite this, Drizzle is already usable in production applications.
- The ecosystem is not yet as mature as Prisma’s. Even with strong TypeScript configuration and eslint rules via _eslint-plugin-drizzle_, I’ve encountered migration issues that better tooling could have caught.
- If working with beginners who are not comfortable with SQL, a higher-level ORM might allow faster development.
- AI tools currently have less knowledge about Drizzle due to fewer available learning materials, so answers may sometimes be outdated, incorrect or not up-to-date.
- The query API does not cover all query variations. For more specific filters, you may need to fall back to SQL-like syntax, which can lead to a mixed querying strategy.

<br>

## Conclusion
If you prefer greater control and want to better understand how your application interacts with the database — even if your knowledge is not yet complete — I definitely recommend giving Drizzle a try.

More experienced developers can benefit from its performance characteristics. This is likely reflected in the rapidly increasing number of npm downloads in 2026.