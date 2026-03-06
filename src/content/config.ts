// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string())
  }),
});

const home = defineCollection({});

export const collections = {
  blog,
  home
};