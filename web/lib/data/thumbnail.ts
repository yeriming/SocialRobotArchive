import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const thumbnailCache = new Map<string, Promise<string | null>>();
const THUMBNAIL_REVALIDATE_SECONDS = 60 * 60 * 24;
const THUMBNAIL_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 1_000_000;
const THUMBNAIL_PROXY_VERSION = "2026-08-11-2";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);

function isPrivateIpAddress(address: string): boolean {
  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
  }

  const octets = address.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return true;
  }

  const [a, b] = octets;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

export async function validateSafeRemoteUrl(input: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }
  if (parsed.username || parsed.password) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return null;
  }
  if (hostname.endsWith(".local")) {
    return null;
  }

  const ipType = isIP(hostname);
  if (ipType !== 0) {
    if (isPrivateIpAddress(hostname)) {
      return null;
    }
    return parsed.toString();
  }

  try {
    const records = await lookup(hostname, { all: true });
    if (records.length === 0) {
      return null;
    }
    if (records.some((record) => isPrivateIpAddress(record.address))) {
      return null;
    }
  } catch {
    return null;
  }

  return parsed.toString();
}

export async function fetchWithSafeRedirects(
  inputUrl: string,
  init: RequestInit,
  maxRedirects = 3
): Promise<Response | null> {
  let currentUrl = await validateSafeRemoteUrl(inputUrl);
  if (!currentUrl) {
    return null;
  }

  for (let i = 0; i <= maxRedirects; i += 1) {
    try {
      const response = await fetch(currentUrl, { ...init, redirect: "manual" });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return null;
        }
        const redirectUrl = new URL(location, currentUrl).toString();
        const validatedRedirectUrl = await validateSafeRemoteUrl(redirectUrl);
        if (!validatedRedirectUrl) {
          return null;
        }
        currentUrl = validatedRedirectUrl;
        continue;
      }
      return response;
    } catch {
      if (i === maxRedirects) {
        return null;
      }
      continue;
    }
  }

  return null;
}

async function readTextWithLimit(response: Response, maxBytes: number): Promise<string | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    return null;
  }

  const decoder = new TextDecoder();
  let totalBytes = 0;
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      return null;
    }
    output += decoder.decode(value, { stream: true });
  }
  output += decoder.decode();
  return output;
}

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
    if (value.startsWith("//")) {
      const base = new URL(baseUrl);
      return `${base.protocol}${value}`;
    }
    const absolute = new URL(value, baseUrl);
    if (absolute.protocol !== "http:" && absolute.protocol !== "https:") {
      return null;
    }
    return absolute.toString();
  } catch {
    return null;
  }
}

function isLikelyImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url);
}

function scoreCandidate(value: string): number {
  const lowered = value.toLowerCase();
  let score = 0;

  if (
    lowered.includes("robot") ||
    lowered.includes("familybot") ||
    lowered.includes("companion") ||
    lowered.includes("pepper") ||
    lowered.includes("aibo") ||
    lowered.includes("elliq") ||
    lowered.includes("pophie") ||
    lowered.includes("paro")
  ) {
    score += 40;
  }
  if (lowered.includes("og-image") || lowered.includes("mainvisual")) {
    score += 25;
  }
  if (isLikelyImageUrl(lowered)) {
    score += 10;
  }

  if (
    lowered.includes("logo") ||
    lowered.includes("icon") ||
    lowered.includes("avatar") ||
    lowered.includes("sprite") ||
    lowered.includes("payment_icons") ||
    lowered.includes("favicon")
  ) {
    score -= 50;
  }
  if (lowered.includes("badge") || lowered.includes("banner-ad")) {
    score -= 25;
  }

  return score;
}

function pickThumbnailFromHtml(html: string, pageUrl: string): string | null {
  const candidates: string[] = [];
  const metaTags = html.match(/<meta\s+[^>]*>/gi) ?? [];
  const linkTags = html.match(/<link\s+[^>]*>/gi) ?? [];
  const imageTags = html.match(/<img\s+[^>]*>/gi) ?? [];

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
      property === "og:image:secure_url" ||
      name === "twitter:image" ||
      name === "twitter:image:src" ||
      name === "image" ||
      name === "thumbnail" ||
      name === "thumbnail_url" ||
      extractAttribute(tag, "itemprop").toLowerCase() === "image"
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
    if (
      rel.includes("image_src") ||
      rel.includes("apple-touch-icon") ||
      rel.includes("icon") ||
      (rel.includes("preload") && extractAttribute(tag, "as").toLowerCase() === "image")
    ) {
      candidates.push(href);
    }
  }

  for (const tag of imageTags) {
    const src = extractAttribute(tag, "src");
    if (src) {
      candidates.push(src);
    }
    const srcSet = extractAttribute(tag, "srcset");
    if (srcSet) {
      const first = srcSet
        .split(",")
        .map((part) => part.trim().split(/\s+/)[0])
        .find(Boolean);
      if (first) {
        candidates.push(first);
      }
    }
  }

  const orderedCandidates = Array.from(new Set(candidates)).sort(
    (a, b) => scoreCandidate(b) - scoreCandidate(a)
  );

  for (const candidate of orderedCandidates) {
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

  const normalizedPageUrl = await validateSafeRemoteUrl(pageUrl);
  if (!normalizedPageUrl) {
    return null;
  }

  if (isLikelyImageUrl(normalizedPageUrl)) {
    return normalizedPageUrl;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), THUMBNAIL_TIMEOUT_MS);

  try {
    const response = await fetchWithSafeRedirects(
      normalizedPageUrl,
      {
        headers: {
          "user-agent": USER_AGENT
        },
        signal: controller.signal,
        next: { revalidate: THUMBNAIL_REVALIDATE_SECONDS }
      },
      3
    );

    if (!response || !response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return null;
    }

    const html = await readTextWithLimit(response, MAX_HTML_BYTES);
    if (!html) {
      return null;
    }
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

  const normalizedPageUrl = await validateSafeRemoteUrl(pageUrl);
  if (!normalizedPageUrl) {
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
    return `/api/thumbnail?url=${encodeURIComponent(normalizedPageUrl)}&v=${encodeURIComponent(THUMBNAIL_PROXY_VERSION)}`;
  } catch {
    return null;
  }
}

export function getThumbnailProxyUrlFromCandidates(candidates: string[]): string | null {
  const normalized = candidates
    .map((candidate) => {
      try {
        return new URL(candidate).toString();
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  const params = new URLSearchParams();
  normalized.forEach((url, idx) => {
    params.set(`url${idx + 1}`, url);
  });
  params.set("url", normalized[0]);
  params.set("v", THUMBNAIL_PROXY_VERSION);
  return `/api/thumbnail?${params.toString()}`;
}

export function getThumbnailFetchUserAgent(): string {
  return USER_AGENT;
}
