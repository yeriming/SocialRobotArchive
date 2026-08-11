import { NextRequest } from "next/server";
import {
  fetchWithSafeRedirects,
  getThumbnailFetchUserAgent,
  getThumbnailFromPageUrl,
  validateSafeRemoteUrl
} from "@/lib/data/thumbnail";

const SVG_FALLBACK = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#f0f0f3"/><text x="320" y="205" text-anchor="middle" font-size="24" fill="#8c8c8c" font-family="Arial, sans-serif">NO IMAGE</text></svg>`;
const MAX_IMAGE_BYTES = 4_000_000;
export const runtime = "nodejs";
const LOCAL_THUMBNAIL_ASSETS: Record<string, { publicPath: string }> = {
  "asset://paro-manual": {
    publicPath: "/manual-thumbnails/paro-manual.png"
  },
  "asset://joobie-manual": {
    publicPath: "/manual-thumbnails/joobie-manual.png"
  },
  "asset://cocomo-manual": {
    publicPath: "/manual-thumbnails/cocomo-manual.png"
  },
  "asset://inu-manual": {
    publicPath: "/manual-thumbnails/inu-manual.png"
  },
  "asset://ballie-manual": {
    publicPath: "/manual-thumbnails/ballie-manual.png"
  },
  "asset://alpha-mini-manual": {
    publicPath: "/manual-thumbnails/alpha-mini-manual.png"
  },
  "asset://tuya-aura-manual": {
    publicPath: "/manual-thumbnails/tuya-aura-manual.png"
  },
  "asset://prime-t1-manual": {
    publicPath: "/manual-thumbnails/prime-t1-manual.png"
  },
  "asset://sweekar-manual": {
    publicPath: "/manual-thumbnails/sweekar-manual.png"
  },
  "asset://jibo-manual": {
    publicPath: "/manual-thumbnails/jibo-manual.png"
  },
  "asset://rumi-manual": {
    publicPath: "/manual-thumbnails/rumi-manual.png"
  }
};

function fallbackImageResponse() {
  return new Response(SVG_FALLBACK, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store, max-age=0"
    }
  });
}

function isLikelyImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".avif") ||
    lower.endsWith(".svg")
  );
}

async function readBufferWithLimit(response: Response, maxBytes: number): Promise<ArrayBuffer | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    return null;
  }

  let totalBytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      return null;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged.buffer;
}

export async function GET(request: NextRequest) {
  const pageUrlCandidates = [
    request.nextUrl.searchParams.get("url"),
    request.nextUrl.searchParams.get("url1"),
    request.nextUrl.searchParams.get("url2"),
    request.nextUrl.searchParams.get("url3")
  ].filter((value): value is string => Boolean(value));

  if (pageUrlCandidates.length === 0) {
    return fallbackImageResponse();
  }

  for (const pageUrlCandidate of pageUrlCandidates) {
    const localAsset = LOCAL_THUMBNAIL_ASSETS[pageUrlCandidate];
    if (localAsset) {
      const targetUrl = new URL(localAsset.publicPath, request.nextUrl.origin);
      return Response.redirect(targetUrl, 302);
    }

    const validatedPageUrl = await validateSafeRemoteUrl(pageUrlCandidate);
    if (!validatedPageUrl) {
      continue;
    }

    const thumbnailUrl = await getThumbnailFromPageUrl(validatedPageUrl);
    if (!thumbnailUrl) {
      continue;
    }

    const validatedThumbnailUrl = await validateSafeRemoteUrl(thumbnailUrl);
    if (!validatedThumbnailUrl) {
      continue;
    }

    try {
      const response = await fetchWithSafeRedirects(
        validatedThumbnailUrl,
        {
          headers: {
            "user-agent": getThumbnailFetchUserAgent(),
            referer: validatedPageUrl
          },
          next: { revalidate: 60 * 60 * 24 }
        },
        3
      );

      if (!response || !response.ok) {
        continue;
      }

      const contentLength = Number.parseInt(response.headers.get("content-length") ?? "0", 10);
      if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/") && !isLikelyImageUrl(validatedThumbnailUrl)) {
        continue;
      }

      const buffer = await readBufferWithLimit(response, MAX_IMAGE_BYTES);
      if (!buffer) {
        continue;
      }
      return new Response(buffer, {
        headers: {
          "content-type": contentType,
          "cache-control": "public, max-age=86400, stale-while-revalidate=604800"
        }
      });
    } catch {
      continue;
    }
  }

  return fallbackImageResponse();
}
