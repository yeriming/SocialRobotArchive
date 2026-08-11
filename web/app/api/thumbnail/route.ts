import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import {
  fetchWithSafeRedirects,
  getThumbnailFetchUserAgent,
  getThumbnailFromPageUrl,
  validateSafeRemoteUrl
} from "@/lib/data/thumbnail";

const SVG_FALLBACK = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#f0f0f3"/><text x="320" y="205" text-anchor="middle" font-size="24" fill="#8c8c8c" font-family="Arial, sans-serif">NO IMAGE</text></svg>`;
const MAX_IMAGE_BYTES = 4_000_000;
export const runtime = "nodejs";
const LOCAL_THUMBNAIL_ASSETS: Record<string, { path: string; contentType: string }> = {
  "asset://paro-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-3abd3f5b-3add-4fb9-91c0-1ab3611ffd11.png",
    contentType: "image/png"
  },
  "asset://joobie-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-a7746e78-0d45-4d4c-aef4-e03bb3062013.png",
    contentType: "image/png"
  },
  "asset://cocomo-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-dfee3aaf-ccdf-47dd-bcda-e60547ce7f03.png",
    contentType: "image/png"
  },
  "asset://inu-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-1440aae2-6283-4b4d-a04b-6c2b89c6d8f9.png",
    contentType: "image/png"
  },
  "asset://ballie-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-b16df0cf-d84e-4eb0-a820-542ae76228dc.png",
    contentType: "image/png"
  },
  "asset://alpha-mini-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-3ac9b84e-3ba8-4eb1-b5e1-95dc1e3de7dc.png",
    contentType: "image/png"
  },
  "asset://tuya-aura-manual": {
    path: "/Users/yeriming/.cursor/projects/Users-yeriming-Desktop-SR-Archive/assets/image-29cae4aa-8369-44a0-b950-630c70601655.png",
    contentType: "image/png"
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
      try {
        const buffer = await readFile(localAsset.path);
        if (buffer.byteLength > MAX_IMAGE_BYTES) {
          continue;
        }
        return new Response(buffer, {
          headers: {
            "content-type": localAsset.contentType,
            "cache-control": "public, max-age=86400, stale-while-revalidate=604800"
          }
        });
      } catch {
        continue;
      }
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
