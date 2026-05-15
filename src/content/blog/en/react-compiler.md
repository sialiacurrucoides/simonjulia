---
title: "React compiler"
description: "The React Compiler is a tool that automatically handles component memoization, whenever it can do so safely, improving application performance."
date: 2026-05-15
tags: ["frontend"]
---
## What is it useful for?
The React Compiler performs the kinds of optimizations that developers would otherwise need to implement manually using `useMemo`, `useCallback`, and `React.memo`. All of this happens at build time, which also helps keep the codebase simpler. As a result, it saves time and helps avoid the incorrect use of these optimization tools. Currently, it is an optional tool, but future React features may rely more heavily on how the compiler works.  

<br>

Having `eslint-plugin-react-hooks` in the project helps the linter warn us when we write code that prevents optimal memoization.
The React Compiler can work efficiently when our components are pure, meaning they always return the same output for the same input and do not cause side effects during rendering.

<br>

## How do we add it to a project?
It is primarily recommended for use with React 19, but it can also be configured for projects using React 17 or 18.
The React documentation clearly explains how it can be used with different types of projects.
For a new Vite project (using `@vitejs/plugin-react` version `6.0.0` or higher) with Typescript, installing the following packages is recommended:

```bash
npm i -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler @types/babel__core
```

<br>

The vite.config.ts file should be extended with the following:
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
It is always worth following the latest documentation, because the compiler ecosystem is still evolving quite rapidly.

<br>

We can verify that everything works by checking React Developer Tools and looking for the small Memo indicators in the component tree.  

<figure> <img src="/react_dev_tools.webp" alt="React Developer Tools component tree view" loading="lazy" /> <figcaption>React Developer Tools component tree view</figcaption> </figure> 

<br>

## What should we still pay attention to?

There may be cases where we experience unexpected slowdowns in a project. One common example is when we use an object received from an external library as a dependency, assuming it has already been memoized. In some situations, only specific properties of the object are stable rather than the entire object itself. If we depend only on the specific value we actually use, we can avoid unnecessary rerenders.  
To fully benefit from the convenience and advantages provided by the compiler, it is still important to understand which factors can lead to performance issues.  
It is also important to keep in mind that this tool optimizes rendering. We still need to pay attention to proper state management, choosing the right data structures, and optimizing expensive calculations.
