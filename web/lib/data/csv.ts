import { readFile } from "node:fs/promises";
import path from "node:path";

const csvCache = new Map<string, Array<Record<string, string>>>();

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === "\"") {
      if (inQuotes && next === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      if (row.some((field) => field.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((field) => field.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export async function readCsvAsObjects(filename: string): Promise<Array<Record<string, string>>> {
  const cached = csvCache.get(filename);
  if (cached) {
    return cached;
  }

  const filePath = path.join(process.cwd(), "..", "data", filename);
  const raw = await readFile(filePath, "utf-8");
  const content = raw.replace(/^\uFEFF/, "");
  const rows = parseCsvRows(content);
  if (rows.length === 0) {
    return [];
  }

  const [headers, ...body] = rows;
  const objects = body.map((fields) => {
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = fields[idx] ?? "";
    });
    return row;
  });

  csvCache.set(filename, objects);
  return objects;
}
