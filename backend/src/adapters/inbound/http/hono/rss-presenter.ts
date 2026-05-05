import type { PublishedThoughtSummary } from "@/modules/content/ports/inbound";

const FEED_TITLE = "vinicius.dev Thoughts";
const FEED_DESCRIPTION = "Published essays and notes from vinicius.dev.";
const FEED_LANGUAGE = "en";

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const formatRssDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toUTCString();
};

const createThoughtUrl = (baseUrl: string, slug: string): string => {
  const encodedSlug = slug
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${normalizeBaseUrl(baseUrl)}/thoughts/${encodedSlug}`;
};

const renderElement = (name: string, value: string): string =>
  value ? `    <${name}>${escapeXml(value)}</${name}>` : "";

const renderThoughtItem = (baseUrl: string, thought: PublishedThoughtSummary): string => {
  const url = createThoughtUrl(baseUrl, thought.slug);
  const pubDate = formatRssDate(thought.publishedAt);
  const categories = thought.tags
    .map((tag) => `    <category>${escapeXml(tag)}</category>`)
    .join("\n");
  const optionalLines = [
    renderElement("description", thought.excerpt),
    pubDate ? `    <pubDate>${escapeXml(pubDate)}</pubDate>` : "",
    categories,
  ].filter(Boolean);

  return [
    "  <item>",
    `    <title>${escapeXml(thought.title)}</title>`,
    `    <link>${escapeXml(url)}</link>`,
    `    <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    ...optionalLines,
    "  </item>",
  ].join("\n");
};

export type RssFeedInput = Readonly<{
  baseUrl: string;
  thoughts: readonly PublishedThoughtSummary[];
}>;

export const presentThoughtsRssFeed = ({ baseUrl, thoughts }: RssFeedInput): string => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const items = thoughts.map((thought) => renderThoughtItem(normalizedBaseUrl, thought));
  const latestPublishedAt = thoughts.find((thought) => thought.publishedAt)?.publishedAt;
  const lastBuildDate = latestPublishedAt ? formatRssDate(latestPublishedAt) : "";
  const channelLines = [
    `  <title>${escapeXml(FEED_TITLE)}</title>`,
    `  <link>${escapeXml(`${normalizedBaseUrl}/thoughts`)}</link>`,
    `  <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    `  <language>${escapeXml(FEED_LANGUAGE)}</language>`,
    lastBuildDate ? `  <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>` : "",
    ...items,
  ].filter(Boolean);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    ...channelLines,
    "</channel>",
    "</rss>",
  ].join("\n");
};
