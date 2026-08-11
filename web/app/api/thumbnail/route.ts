import { NextRequest } from "next/server";
import {
  getThumbnailFetchUserAgent,
  getThumbnailFromPageUrl
} from "@/lib/data/thumbnail";

const SVG_FALLBACK = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#f0f0f3"/><text x="320" y="205" text-anchor="middle" font-size="24" fill="#8c8c8c" font-family="Arial, sans-serif">NO IMAGE</text></svg>`;

function fallbackImageResponse() {
  return new Response(SVG_FALLBACK, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}

export async function GET(request: NextRequest) {
  const pageUrl = request.nextUrl.searchParams.get("url") ?? "";
  if (!pageUrl) {
    return fallbackImageResponse();
  }

  const thumbnailUrl = await getThumbnailFromPageUrl(pageUrl);
  if (!thumbnailUrl) {
    return fallbackImageResponse();
  }

  try {
    const response = await fetch(thumbnailUrl, {
      headers: { "user-agent": getThumbnailFetchUserAgent() },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      return fallbackImageResponse();
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return fallbackImageResponse();
    }

    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400"
      }
    });
  } catch {
    return fallbackImageResponse();
  }
}
