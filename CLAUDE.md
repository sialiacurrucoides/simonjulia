# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio + blog site for Simon Júlia, built with Astro (v6, no UI framework adapter — `.astro` components only). Statically generated, deployed at https://simonjulia.hu/.

## Commands

```sh
npm run dev       # dev server at localhost:4321
npm run build     # outputs to ./dist/
npm run preview   # preview the production build locally
npm run astro check   # type-check .astro files (no separate lint/test script exists)
```

There is no test suite and no linter configured in this repo.

## Architecture

### i18n via path prefix, not Astro's built-in i18n routing

Locales are `en` and `hu`. Routing is done manually with a `[lang]` dynamic segment rather than Astro's `i18n` config:

- `src/pages/[lang]/index.astro` — main page, valid for `lang` in `{en, hu}` via `getStaticPaths`.
- `src/pages/[lang]/blog/[slug].astro` — blog post pages, paths generated from blog collection entries.
- `src/pages/[lang]/tags/[tag].astro` — tag listing pages, built separately per language (filters posts by `id` prefix `en/` or `hu/`).
- `src/pages/index.astro` redirects `/` → `/en/#blog`.

UI strings are not handled by content collections — they live in `src/i18n/en.ts` and `src/i18n/hu.ts`, typed by `src/i18n/types.ts` (`Translation` type), and looked up at render time with `getLang(lang)` from `src/i18n/index.ts`. Every component that needs copy reads `Astro.params.lang` (or accepts a `lang` prop) and calls `getLang`. When adding a new UI string, add the key to `Translation` in `src/i18n/types.ts` first, then fill it in both `en.ts` and `hu.ts`.

`LanguageSelector.astro` switches language by stripping the `/en` or `/hu` prefix from `Astro.url.pathname` and re-prefixing — any new route segment must stay compatible with that regex (`/^\/(en|hu)/`).

### Blog content

Blog posts are an Astro content collection defined in `src/content.config.ts` (schema: `title`, `description`, `date`, `tags`). Posts live in `src/content/blog/en/*.md` and `src/content/blog/hu/*.md` — **same slug across both folders for translated pairs** (e.g. `mfa.md` exists in both `en/` and `hu/`). The collection entry `id` is `"<lang>/<slug>.md"`; routes split on `/` to recover `lang` and `slug`.

Posts render through `MarkdownLayout.astro`, which expects `frontmatter` (title/description/date/tags) and renders `<TagList>` plus the post body via `<slot />`.

### Components

- `Navigation.astro` / `Footer.astro` — shared chrome, included once in `Layout.astro`.
- `DigitalGarden.astro`, `AboutMe.astro`, `Projects.astro` — sections of the single-page home layout, each fed by `Astro.params.lang`.
- `ProjectCard.astro` is driven by the static `projects` array in `src/constants/index.ts` (not a content collection) — add new portfolio projects there, plus matching images in `src/assets/projects/`.
- `src/assets/icons/*.astro` — inline SVG icon components used across project/skill listings.
- Dyslexia-friendly mode (`DyslexicModeToggle.astro`) toggles the `--font-dyslexic` CSS variable font (`@fontsource/opendyslexic`) registered in `astro.config.mjs`.

### Astro config notes (`astro.config.mjs`)

- Fonts (`Montserrat`, `OpenDyslexic`) are registered via the experimental `fonts` config using `fontProviders.fontsource()`.
- `@astrojs/sitemap` integration is enabled; `site` is set to the production URL, required for correct sitemap/canonical URLs.
- A custom CSP (`security.csp.directives`) is set — when adding any external resource (script, font, image host, API call), update the relevant `*-src` directive here or it will be blocked in production.
