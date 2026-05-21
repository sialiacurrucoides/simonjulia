---
title: "TanStack Router with TanStack Query"
description: "The increasingly popular TanStack Router provides type-safe routing and integrates seamlessly with TanStack Query, a widely used solution for server state management."
date: 2026-05-21
tags: ["frontend"]
---

## When Should We Use It?

It is probably fair to say that Next.js applications have become dominant in the React ecosystem. They place server-side rendering at the center of the architecture, rethink how external data is handled, and largely define the core logic of routing. However, this is not always the most optimal strategy. For example, if we are building an application where every feature is available only after authentication, data traffic is highly intensive, and the application is not hosted on Vercel infrastructure, then a Vite-based application combined with TanStack tools may provide better performance and a better developer experience.

<br>

## TanStack Router

TanStack Router supports two different routing approaches, but it recommends the file-based strategy. This may already feel familiar if you have worked with the Next.js App Router. The file name corresponds to the route itself.

The documentation clearly explains the basic configuration, so getting started is straightforward. Creating a new route requires zero AI tokens 🙂 because, while the dev server is running, the router plugin automatically generates the route definition code as soon as we create and name a file. We can freely rename the function created under `Route` and specify which component should be rendered.

What makes TanStack Router especially impressive is that if we provide a non-existent route to a `Link` component, TypeScript immediately reports a compilation error. This is possible because, while the dev server is running, a `routeTree.gen.ts` file is automatically generated, containing all the necessary type definitions.

<br>

Another major advantage of TanStack Router is that it allows us to fetch data before the page is rendered. In cases where the data can be retrieved quickly, this can significantly improve the user experience, because users do not have to deal with a flashing loading component after clicking on a link. The Router was designed with TanStack Query integration in mind. This allows us to store fetched data not in the router cache, but in the TanStack Query cache instead. I will show an example of this below.

<br>

## TanStack Query

TanStack Query has long been a popular solution for server state management. It associates requests with query keys and configuration options, such as how long data should be considered fresh. We can even configure this duration to be infinite, meaning the data will always be read from the cache and only refetched when the corresponding query key is manually invalidated. A common example would be a mutation where a new item is created and a related list needs to be refreshed.

<br>

## Example of Combined Usage

Let’s look at an example where we preload data into the query cache before navigating to the page associated with a specific link. More precisely: we check whether the data already exists, and if it does not exist or is no longer fresh, we fetch it.

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

Let’s go through the individual parts:

- __validateSearch__ : here we can define a schema that the router uses to validate the types of search parameters. The latest versions of popular validation libraries no longer require installing adapters (e.g. Zod 4, Valibot 1.0, Arktype 2.0-rc)

- __loaderDeps__ : here we define which dependencies should be used in the following loader method. The parameters are intentionally listed individually so that unnecessary requests can be avoided when unrelated search parameters change and are not relevant to the API call

- __loader__ : this is where we fetch data from the backend

- __context__ : if we define the `queryClient` as a context property in the `main.tsx` file, it becomes available here. The configuration may look something like this:

```
// src/main.tsx
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})
```

- __ensureQueryData__ : checks the query cache and performs the request if no fresh data is available

- __postsQueryOptions__ : this is not a built-in utility function; I simply want to highlight that it is a good practice to store the query key and related options in a reusable variable so they can easily be shared across different files

<br>

Inside the page component, we can access the data like this:

```
const { data, error } = useSuspenseQuery(
  postsQueryOptions(queryString),
)
```

or:

```
const { data, error } = useQuery(
  postsQueryOptions(queryString),
)
```

- __useSuspenseQuery__ : a Suspense-compatible query hook. React Suspense boundaries handle the loading state, so there is no need for separate loading state management. It can also be streamed when combined with SSR.

- __useQuery__ : a classic hook for client-side data fetching.

<br>

## What Should We Pay Attention To?

Since these tools are popular and open source, they can become attractive targets for attacks. One such incident happened on May 11, when an infected package version appeared in the npm registry that could execute malicious code during installation and potentially collect sensitive information.

Initially, all versions were flagged, which caused my own automation to report a critical vulnerability as well. Fortunately, I was not affected, but it gave me an opportunity to investigate the situation in more detail.

These kinds of attacks are usually detected relatively quickly, so one possible defense strategy is configuring the package manager to install only packages that were published several days ago.

In npm, this can be configured in the `.npmrc` file like this:

```
min-release-age=3
```

In pnpm:

```
minimumReleaseAge: 4320 # 3 days in minutes
```

It can also be useful to use the `--ignore-scripts` flag during installation when downloading packages that are not expected to execute any install scripts.
