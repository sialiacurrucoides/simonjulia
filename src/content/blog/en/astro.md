---
title: "About Astro JS"
description: "Astro is a JavaScript web framework optimized for building fast, content-driven websites."
date: 2026-03-11
tags: ["frontend", "astro"]
---
When building a simple, predominantly static website, I was in a dilemma about whether to use a tool that enables SSR (Server-Side Rendering), such as Next.js, or to stick with a vanilla HTML + JavaScript solution.

The advantage of the latter is that I would probably run into fewer issues like: why the development and production builds differ, why certain functions occasionally become very slow, or what advantages I might lose if I don’t use Vercel as the hosting provider.

However, its downside is that we lose many useful patterns and built-in optimizations, it becomes easier to write spaghetti code, and worst of all, there is no TypeScript, our favorite safety net.

<br>

So when I discovered Astro, I felt genuine excitement — it seemed like a solution to the dilemma above.
Astro’s language is a HTML superset, meaning it is essentially enhanced HTML. Anyone familiar with the basics of HTML and who has encountered JSX syntax will feel completely at home. On top of that, TypeScript is supported by default.

```
---
    import { Product } from "../types"
    import { currency } from "../constants"

    const fruits = ["apple", "pear", "orange"];

    const myProduct: Product = {
        name: "Test",
        price: 1000,
    }
---

    <ul>
        {myList.map((fruit) => (
            <li>{fruit}</li>
        ))}
    </ul>
    {myProduct && <p>{myProduct.name} costs {myProduct.price} {currency}</p>}
    <br>

```

<br>

As you can see from the example above, we can use variables inside curly braces, which are defined in the area surrounded by ---, called the __frontmatter__. Essentially, we can perform any JSX-like operation whose result can be converted into text.

However, we cannot attach functions directly to attributes such as onclick. In such cases, we either use the classic imperative approach inside a script tag (e.g., document.querySelector), or we add our favorite framework to the project — such as __React__, __Vue__, __Svelte__, __Preact__ etc — with a simple add command, create a component, and import it.

An advantage is that the code required for the chosen framework is not downloaded on every page, only on the pages where it is actually used.

<br>

To handle dynamic parts, Astro introduced the concept of Astro Islands. These are pieces of code where we explicitly indicate that we want more than just static HTML. For this purpose, client directives determine when the JavaScript should be loaded.
```
    <MyReactComponent client:load />
``` 

<br>

Astro is also a huge help when it comes to image optimization. The __Image__ and __Picture__ components enforce best practices (for example requiring an alt attribute and automatically enabling lazy loading), while also ensuring that the image is served in the ideal size and format.

The advantage of the Picture component compared to Image is that we can define a whole list of formats (e.g. formats={['avif', 'webp', 'png']}). This means that if we start with a PNG image, Astro will generate optimized versions of it and serve the most appropriate one depending on what the user’s browser supports.

<br>

Astro is particularly well suited for building websites with a lot of static content, such as blogs. In these cases, content can be written in __Markdown__ files, and the posts can be displayed dynamically.

Files created in the pages folder automatically correspond to routes. However, if the file name is wrapped in square brackets, we can generate all routes that use that parameter using the _getStaticPaths_ function (for example: mydomain/posts/[post-slug]).

Markdown files can then be imported as a collection using the _getCollection_ function, which belongs to the _astro:content_ API.

<br>

Based on the above, one might conclude that Astro can only be used for static websites. In reality, however, its capabilities are steadily expanding. With dynamic collections, the recently introduced sessions, and planned caching features, it is giving developers more and more tools.

In server mode, many things can already be implemented that are also possible with Next.js.

I’m curious to see how the future of this framework will unfold.