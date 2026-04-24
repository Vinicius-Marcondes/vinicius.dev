const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const createAbsoluteUrl = (baseUrl: string, path: string): string => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (path === "/") {
    return `${normalizedBaseUrl}/`;
  }

  return `${normalizedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export type SitemapXmlInput = Readonly<{
  baseUrl: string;
  paths: readonly string[];
}>;

export const presentSitemapXml = ({ baseUrl, paths }: SitemapXmlInput): string => {
  const urls = paths.map((path) => createAbsoluteUrl(baseUrl, path));
  const entries = urls.map(
    (url) => ["  <url>", `    <loc>${escapeXml(url)}</loc>`, "  </url>"].join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");
};
