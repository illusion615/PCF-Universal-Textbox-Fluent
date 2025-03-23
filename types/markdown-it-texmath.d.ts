declare module 'markdown-it-texmath' {
    import MarkdownIt from 'markdown-it';

    interface TexmathOptions {
        engine?: any;
        delimiters?: 'dollars' | 'brackets' | 'gitlab' | 'julia';
        katexOptions?: any;
    }

    export default function texmath(md: MarkdownIt, options?: TexmathOptions): void;
}