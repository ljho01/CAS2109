import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "ko"; // 기본값은 한국어

    // 팟캐스트 파일 경로 생성 (언어별)
    const filePath = path.join(
      process.cwd(),
      "public",
      "podcasts",
      `${id}-${locale}.wav`
    );

    try {
      // 파일이 존재하는지 확인
      await fs.access(filePath);

      // 파일 읽기
      const fileBuffer = await fs.readFile(filePath);

      // WAV 파일 응답 헤더 설정
      const headers = new Headers();
      headers.set("Content-Type", "audio/wav");
      headers.set("Content-Length", fileBuffer.length.toString());
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=31536000"); // 1년 캐시
      headers.set("Vary", "locale"); // locale에 따라 다른 응답

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (_fileError) {
      console.log(_fileError);
      // 해당 언어의 파일이 없는 경우, 기본 언어(한국어)로 fallback 시도
      if (locale !== "ko") {
        const fallbackPath = path.join(
          process.cwd(),
          "public",
          "podcasts",
          `${id}-ko.wav`
        );

        try {
          await fs.access(fallbackPath);
          const fileBuffer = await fs.readFile(fallbackPath);

          const headers = new Headers();
          headers.set("Content-Type", "audio/wav");
          headers.set("Content-Length", fileBuffer.length.toString());
          headers.set("Accept-Ranges", "bytes");
          headers.set("Cache-Control", "public, max-age=31536000");

          return new NextResponse(fileBuffer, {
            status: 200,
            headers,
          });
        } catch (_fallbackError) {
          console.log(_fallbackError);
          // fallback도 실패한 경우
        }
      }

      // 파일이 없는 경우
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error serving podcast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 팟캐스트 파일 존재 여부만 확인하는 HEAD 메서드
export async function HEAD(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "ko";

    const filePath = path.join(
      process.cwd(),
      "public",
      "podcasts",
      `${id}-${locale}.wav`
    );

    try {
      const stats = await fs.stat(filePath);

      const headers = new Headers();
      headers.set("Content-Type", "audio/wav");
      headers.set("Content-Length", stats.size.toString());
      headers.set("Accept-Ranges", "bytes");
      headers.set("Vary", "locale");

      return new NextResponse(null, {
        status: 200,
        headers,
      });
    } catch (_fileError) {
      console.log(_fileError);
      // 해당 언어의 파일이 없는 경우, fallback 확인
      if (locale !== "ko") {
        const fallbackPath = path.join(
          process.cwd(),
          "public",
          "podcasts",
          `${id}-ko.wav`
        );

        try {
          const stats = await fs.stat(fallbackPath);

          const headers = new Headers();
          headers.set("Content-Type", "audio/wav");
          headers.set("Content-Length", stats.size.toString());
          headers.set("Accept-Ranges", "bytes");

          return new NextResponse(null, {
            status: 200,
            headers,
          });
        } catch (_fallbackError) {
          console.log(_fallbackError);
          // fallback도 실패
        }
      }

      return new NextResponse(null, { status: 404 });
    }
  } catch (_error) {
    console.log(_error);
    return new NextResponse(null, { status: 500 });
  }
}
