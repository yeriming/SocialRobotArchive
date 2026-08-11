const thumbnailCache = new Map<string, Promise<string | null>>();
const THUMBNAIL_REVALIDATE_SECONDS = 60 * 60 * 24;
const THUMBNAIL_TIMEOUT_MS = 5000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function extractAttribute(tag: string, attrName: string): string {
  const direct = new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, "i").exec(tag);
  if (direct?.[1]) {
    return direct[1].trim();
  }
  return "";
}

function normalizeToAbsoluteUrl(value: string, baseUrl: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const absolute = new URL(value, baseUrl);
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") {
      return null;
    }
    return absolute.toString();
  } catch {
    return null;
  }
}

function pickThumbnailFromHtml(html: string, pageUrl: string): string | null {
  const candidates: string[] = [];
  const metaTags = html.match(/<meta\s+[^>]*>/gi) ?? [];
  const linkTags = html.match(/<link\s+[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const property = extractAttribute(tag, "property").toLowerCase();
    const name = extractAttribute(tag, "name").toLowerCase();
    const content = extractAttribute(tag, "content");
    if (!content) {
      continue;
    }

    if (
      property === "og:image" ||
      property === "og:image:url" ||
      name === "twitter:image" ||
      name === "twitter:image:src"
    ) {
      candidates.push(content);
    }
  }

  for (const tag of linkTags) {
    const rel = extractAttribute(tag, "rel").toLowerCase();
    const href = extractAttribute(tag, "href");
    if (!href) {
      continue;
    }
    if (rel.includes("image_src") || rel.includes("apple-touch-icon") || rel === "icon") {
      candidates.push(href);
    }
  }

  for (const candidate of candidates) {
    const normalized = normalizeToAbsoluteUrl(candidate, pageUrl);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

async function fetchThumbnail(pageUrl: string): Promise<string | null> {
  if (!pageUrl) {
    return null;
  }

  let normalizedPageUrl = "";
  try {
    normalizedPageUrl = new URL(pageUrl).toString();
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), THUMBNAIL_TIMEOUT_MS);

  try {
    const response = await fetch(normalizedPageUrl, {
      headers: {
        "user-agent": USER_AGENT
      },
      signal: controller.signal,
      next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return pickThumbnailFromHtml(html, normalizedPageUrl);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getThumbnailFromPageUrl(pageUrl: string): Promise<string | null> {
  if (!pageUrl) {
    return null;
  }

  let normalizedPageUrl = "";
  try {
    normalizedPageUrl = new URL(pageUrl).toString();
  } catch {
    return null;
  }

  const cached = thumbnailCache.get(normalizedPageUrl);
  if (cached) {
    return cached;
  }

  const promise = fetchThumbnail(normalizedPageUrl);
  thumbnailCache.set(normalizedPageUrl, promise);
  return promise;
}

export function getThumbnailProxyUrl(pageUrl: string): string | null {
  if (!pageUrl) {
    return null;
  }

  try {
    const normalizedPageUrl = new URL(pageUrl).toString();
    return `/api/thumbnail?url=${encodeURIComponent(normalizedPageUrl)}`;
  } catch {
    return null;
  }
}

export function getThumbnailFetchUserAgent(): string {
  return USER_AGENT;
}
