//* src/app/api/subway-lines/route.ts

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  const filePath = path.join(process.cwd(), "src/data/nyc-subway-lines.geojson");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileContent);
    return NextResponse.json(json);
  } catch (err) {
    console.error("Failed to read subway lines file", err);
    return NextResponse.json({ error: "Failed to load subway lines" }, { status: 500 });
  }
}
