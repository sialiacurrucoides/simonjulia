import type { BlogArticle } from "../content/config";

export type Article = {
    file: string;
    frontmatter: BlogArticle;
}