export type Article = {
    file: string;
    frontmatter: {
        title: string;
        description: string;
        date: string;
        tags: string[];
    };
}