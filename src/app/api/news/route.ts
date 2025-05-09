import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const filePath = path.join(process.cwd(), "src/data/news.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  const news = JSON.parse(fileContents);

  const start = (page - 1) * limit;
  const end = start + limit;
  const pagedNews = news.slice(start, end);
  const hasMore = start + pagedNews.length < news.length;

  return NextResponse.json({ news: pagedNews, hasMore });
}
