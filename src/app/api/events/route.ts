import { NextRequest, NextResponse } from "next/server";
import { EventData } from "@/types/events";

export async function POST(request: NextRequest) {
  try {
    const { extent, yearRange, locale = "ko" } = await request.json();

    // locale에 따라 적절한 이벤트 데이터 로드
    let events: EventData[];
    try {
      if (locale === "en") {
        events = (await import("@/events/en.json")).default;
      } else {
        events = (await import("@/events/ko.json")).default;
      }
    } catch (error) {
      console.error(`Failed to load events for locale ${locale}:`, error);
      // fallback to Korean events
      events = (await import("@/events/ko.json")).default;
    }

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
