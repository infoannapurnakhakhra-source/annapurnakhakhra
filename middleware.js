import { NextResponse } from 'next/server';

// List of bots that should be pre-rendered
const BOTS = [
    'googlebot',
    'yahoo',
    'bingbot',
    'baiduspider',
    'ask jeeves',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'WhatsApp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'SkypeUriPreview',
    'nuzzel',
    'Discordbot',
    'Google Page Speed',
    'Qwantify',
    'pinterestbot',
    'Bitrix link preview',
    'XING-content-gathering-bot',
    'telegrambot',
    'google-read-aloud',
    'google-lightweight'
];

// File extensions to ignore
const IGNORED_EXTENSIONS = [
    '.js',
    '.css',
    '.xml',
    '.less',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.pdf',
    '.doc',
    '.txt',
    '.ico',
    '.rss',
    '.zip',
    '.mp3',
    '.rar',
    '.exe',
    '.wmv',
    '.doc',
    '.avi',
    '.ppt',
    '.mpg',
    '.mpeg',
    '.tif',
    '.wav',
    '.mov',
    '.psd',
    '.ai',
    '.xls',
    '.mp4',
    '.m4a',
    '.swf',
    '.dat',
    '.dmg',
    '.iso',
    '.flv',
    '.m4v',
    '.torrent',
    '.woff',
    '.ttf',
    '.svg',
    '.webmanifest',
    '.html'
];

export function middleware(request) {
    const userAgent = request.headers.get('user-agent')?.toLowerCase();
    const url = new URL(request.url);
    const path = url.pathname;
    const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

    // Check if the path should be ignored (e.g., static assets, verification files)
    const isIgnored = IGNORED_EXTENSIONS.some(extension => normalizedPath.endsWith(extension));

    // Explicitly ignore verification files and other common root assets
    const isStaticAsset = normalizedPath.startsWith('/google') ||
        normalizedPath.startsWith('/sitemap') ||
        normalizedPath === '/robots.txt' ||
        normalizedPath === '/favicon.ico';

    // If it's an ignored path or a static asset, proceed as normal immediately
    if (isIgnored || isStaticAsset) {
        return NextResponse.next();
    }

    // Check if it's a bot
    const isBot = userAgent && BOTS.some(bot => userAgent.includes(bot));

    // If it's a bot and not an ignored path, proxy to Prerender.io
    if (isBot) {
        const prerenderUrl = `https://service.prerender.io/${request.url}`;

        // Create new headers with the token
        const headers = new Headers(request.headers);
        headers.set('X-Prerender-Token', process.env.PRERENDER_TOKEN || 'cKoSma8ERylDy8SFmsJC');

        return fetch(prerenderUrl, {
            headers: headers,
            method: request.method,
        });
    }

    // Otherwise, proceed as normal
    return NextResponse.next();
}

// Optionally, configure matcher to limit where middleware runs
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - robots.txt
         * - sitemap.xml
         * - google verification files
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap.*\\.xml|google.*\\.html).*)',
    ],
};
