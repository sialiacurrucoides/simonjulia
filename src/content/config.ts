// src/content/config.ts
import { defineCollection, z } from "astro:content";

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string())
  });

const blog = defineCollection({
  schema: blogSchema,
});

export type BlogArticle = z.infer<typeof blogSchema>;


export const collections = {
  blog
};