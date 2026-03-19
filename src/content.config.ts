// src/content.config.ts
import { glob } from "astro/loaders";
import { defineCollection, type CollectionEntry } from "astro:content";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string())
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: blogSchema,
});

export type BlogArticle = CollectionEntry<"blog">;

export const collections = {
  blog,
};