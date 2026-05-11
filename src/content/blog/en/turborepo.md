---
title: "Turborepo"
description: "Turborepo is a monorepo management tool that maximizes build speed through parallelization and caching, making it easier to share packages across multiple applications."
date: 2026-05-11
tags: ["backend", "frontend"]
---

## What is a monorepo?

A monorepo is a codebase (repository) where multiple applications are managed in a single place, partly to avoid duplicating shared resources and having to modify them in multiple locations. Shared resources can be used between a web app and an admin app, a web app and a mobile app, any frontend and the backend, a documentation app, or a marketing app. In many cases, it makes sense to maintain these as separate applications because different tech stacks may be ideal for them and because they often need to scale independently.  

Shared resources may include types, base TypeScript configurations, translations, API calls, UI components in the case of multiple web applications (e.g. admin and public web app), or functions containing business logic. 

<br>

Of course, in the case of a public project this is not always necessary, because shared units can be published as npm packages. However, in many situations the code is business-critical and therefore not public. In such cases, it is also possible to set up an internal registry, although this is more common at very large companies. For smaller projects, a monorepo is often a better choice. Naturally, it also has advantages for larger projects. Monorepo structures are used by _Next.js_, _Vue.js_, _Angular_, _React_, _TypeScript_, _npm CLI_, _Jest_, and even _Google_.

<br>

## Turborepo features

One of the advantages of Turborepo is that it can create an out-of-the-box monorepo structure without requiring extensive initial configuration, using the `create-turbo@latest` command. By default, we get an `apps` folder for applications and a `packages` folder for shared tooling and utilities. Inside `packages`, there is typically a `typescript-config` package and an `eslint-config` package.

Turborepo can build multiple apps simultaneously and because it uses deterministic, hash-based caching, subsequent builds only rebuild the units where changes occurred and the cache became invalidated. For example, if a UI package changes, only the applications depending on it will be rebuilt.  
In addition, it runs processes such as tests and linting in parallel, which can significantly reduce CI and local build times.

Turborepo itself is not a package manager. It is usually used together with a workspace-based package manager such as _pnpm_, _Yarn_, or _npm_.

<br>

Turborepo was acquired by Vercel, which provides strong long-term support. By default, the initialization process also creates two Next.js applications (at least in version "^2.9.6"): a web app and a documentation app for it. Of course, these are optional and any type of application can be created inside the `apps` directory, such as Expo for mobile apps, Vite for admin panels, or Astro for marketing websites.

The central element of Turborepo is the `turbo.json` file, where we can define how tasks (e.g. build, lint, test, dev) depend on each other, which files should be cached, and in what order the pipeline should run. Turborepo uses a __dependency graph__ to determine which packages and applications need to be rerun. A simple configuration might look like this (2026 version):

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
Using the `dependsOn` field, we can specify that a task should only run after its dependencies have completed successfully.  
The `outputs` field defines which generated files should be cached by Turborepo. As a result, later build processes can become significantly faster, especially in CI environments or larger monorepos.  

The `with` field allows other tasks to be started in parallel.

<br>

Local usage of Turborepo and the local cache are free. Costs only become relevant when cloud CI resources such as Vercel Remote Cache are needed.

<br>

## Adding new packages

When creating a new package, we should create a `package.json` file and define its name. It is recommended to use a prefix such as @myorg/api, which then allows us to add it as a dependency in any application:
```
"@myorg/api": "*"
```
It is also important to define the __exports__ field, where we specify which files are accessible for consuming applications. If it is a small package and we want to expose everything, it can look like this:
```
"exports": {
   "./dist/index.js"
  },
```
The new package should also contain a tsconfig.json file. A simple version might look like this:
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

## Managing TypeScript configs

It is very useful if all projects use TypeScript rules with a similar level of strictness. However, there will most likely be differences between the configurations of individual applications. A practical strategy is to create a `base.json` file inside the `tsconfig-config` package that contains the shared settings. For example:
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
Each application can then have its own JSON configuration file that extends the base configuration and customizes it further. For example:
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

Finally, the applications themselves only need to reference the framework-specific config inside their own _tsconfig.json_ file, for example:
```
"extends": "@repo/typescript-config/vite.json",
```

<br>

## Advantages and disadvantages

There are a few things worth considering before fully committing to a monorepo setup. 
- The deployment process can become more complicated when we only want to deploy a single application from the repository.
- It also takes some time to get used to the workflow. An import may work locally, but later fail in production because we forgot to declare the relevant package as a dependency.
- For beginners, understanding dependencies and configuration locations can also be confusing. For example, even if a .gitignore file is created inside a newly initialized app, the rules defined in the root directory will be applied. Other important configuration files are also located there, so deployments are often initiated from the root as well.
- Another disadvantage is that Git history can become more complicated and CI checkout times may increase.
- It is also worth keeping in mind that every developer has visibility into every project. This can be an advantage for smaller teams, but in larger companies with many rotating developers it may also be considered a drawback.

<br>

One of the biggest advantages, however, is that in a continuously evolving project we do not need to fix the same issue in multiple places whenever a type changes, an API call is updated, a translation is modified, or business logic evolves. Developers working on different parts of the system also follow essentially the same strategies for TypeScript, linting, and git hooks. Build times are optimized to the point where managing multiple applications inside a single repository generally does not introduce significant performance issues.