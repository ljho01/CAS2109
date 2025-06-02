import { NextRequest, NextResponse } from "next/server";
import events from "@/events.json";

interface EventData {
  title: string;
  description: string;
  location: number[]; // [lat, lng] - changed from tuple to array
  date: string;
  district: string;
  image_url: string;
  ref_url: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { extent, yearRange } = await request.json();

    // extent 형식: [minLon, minLat, maxLon, maxLat]
    const [minLon, minLat, maxLon, maxLat] = extent;
    const [minYear, maxYear] = yearRange;

    // 지리적 범위와 연도 범위에 따라 이벤트 필터링
    const filteredEvents = events.filter((event: EventData) => {
      const [lat, lng] = event.location;
      const eventYear = new Date(event.date).getFullYear();

      // 지리적 범위 체크
      const inGeographicBounds =
        lng >= minLon && lng <= maxLon && lat >= minLat && lat <= maxLat;

      // 연도 범위 체크
      const inYearRange = eventYear >= minYear && eventYear <= maxYear;

      return inGeographicBounds && inYearRange;
    });

    // 전체 데이터의 연도 범위 계산 (UI 업데이트용)
    const allYears = events.map((event: EventData) =>
      new Date(event.date).getFullYear()
    );
    const globalMinYear = Math.min(...allYears);
    const globalMaxYear = Math.max(...allYears);

    return NextResponse.json({
      events: filteredEvents,
      total: filteredEvents.length,
      minYear: globalMinYear,
      maxYear: globalMaxYear,
      extent: {
        requested: extent,
        filtered: filteredEvents.length,
      },
    });
  } catch (error) {
    console.error("Error processing events request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
