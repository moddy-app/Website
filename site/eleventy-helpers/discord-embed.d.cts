export function resolveLocale(lang: string | null | undefined, fallback?: string): string;
export function localeForPath(pathname: string): string | null;
export function homeEmbedJson(code: string, params?: URLSearchParams): string;
export function homeEmbedHead(code: string, pageUrl: string, params?: URLSearchParams): string;
export function homeUrl(code: string): string;
export function homePreviewPage(pathname: string, params: URLSearchParams): string;
