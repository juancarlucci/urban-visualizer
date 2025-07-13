//* File: src/app/api/subway-stations/route.ts

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET() {
  const filePath = path.join(process.cwd(), "src/data/nyc-subway-stations.geojson");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileContent);
    return NextResponse.json(json);
  } catch (err) {
    console.error("Failed to read subway stations file", err);
    return NextResponse.json({ error: "Failed to load subway stations" }, { status: 500 });
  }
}
