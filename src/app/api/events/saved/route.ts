import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { EventData } from "@/types/events";

export async function POST(request: NextRequest) {
  try {
    const { eventIds, locale } = await request.json();

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // 로케일에 따른 JSON 파일 경로 설정
    const eventsFilePath = path.join(
      process.cwd(),
      "src",
      "events",
      `${locale || "ko"}.json`
    );

    // JSON 파일 읽기
    let eventsData: EventData[] = [];
    try {
      const fileContent = fs.readFileSync(eventsFilePath, "utf-8");
      eventsData = JSON.parse(fileContent);
    } catch (fileError) {
      console.error("Error reading events file:", fileError);
      // 파일을 읽을 수 없는 경우 기본 로케일로 시도
      if (locale !== "ko") {
        try {
          const fallbackPath = path.join(
            process.cwd(),
            "src",
            "events",
            "ko.json"
          );
          const fallbackContent = fs.readFileSync(fallbackPath, "utf-8");
          eventsData = JSON.parse(fallbackContent);
        } catch (fallbackError) {
          console.error("Error reading fallback events file:", fallbackError);
          return NextResponse.json(
            { error: "Failed to load events data" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Failed to load events data" },
          { status: 500 }
        );
      }
    }

    // 요청받은 ID들에 해당하는 이벤트들만 필터링
    const savedEvents = eventsData.filter((event) =>
      eventIds.includes(event.id)
    );

    return NextResponse.json({
      events: savedEvents,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching saved events:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved events" },
      { status: 500 }
    );
  }
}
