"use client";
import { useEffect, useState } from "react";

interface News {
  id: string;
  title: string;
  related: string;
  description: string;
  positive: string;
  negative: string;
}

type LikeType = "like" | "dislike";

function getLocalLikes() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("news-likes") || "{}") as Record<
      string,
      LikeType
    >;
  } catch {
    return {};
  }
}

export default function MePage() {
  const [news, setNews] = useState<News[]>([]);
  const [likes, setLikes] = useState<Record<string, LikeType>>({});
  const [relatedStats, setRelatedStats] = useState<
    Record<string, { like: number; dislike: number }>
  >({});

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data.news || data));
    setLikes(getLocalLikes());
  }, []);

  useEffect(() => {
    // 뉴스와 likes를 바탕으로 related별 집계
    const stats: Record<string, { like: number; dislike: number }> = {};
    news.forEach((n) => {
      const likeType = likes[n.id];
      if (!likeType) return;
      // related는 '#인물1 #인물2' 형식일 수 있으니 분리
      n.related.split(" ").forEach((person) => {
        if (!person) return;
        if (!stats[person]) stats[person] = { like: 0, dislike: 0 };
        if (likeType === "like") stats[person].like++;
        if (likeType === "dislike") stats[person].dislike++;
      });
    });
    setRelatedStats(stats);
  }, [news, likes]);

  // 수평선상에 인물별 평가 시각화
  const persons = Object.keys(relatedStats);
  return (
    <div className="relative flex flex-col gap-4 w-full h-screen overflow-hidden">
      <div className="pt-12 w-full bg-background/50 backdrop-blur-lg z-10 px-2">
        <h1 className="text-2xl font-bold">내 인물 평가</h1>
      </div>
      {persons.length === 0 ? (
        <div className="text-muted-foreground">
          아직 평가한 뉴스가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {persons.map((person) => {
            const { like, dislike } = relatedStats[person];
            const total = like + dislike;
            // 0~100% 위치 계산 (like: 오른쪽, dislike: 왼쪽)
            const percent = total === 0 ? 50 : Math.round((like / total) * 100);
            return (
              <div key={person} className="flex items-center gap-4">
                <span className="w-16 text-xs text-muted-foreground">
                  {person}
                </span>
                <div className="relative w-48 h-4 bg-gray-200 rounded flex items-center">
                  {/* 싫어요(왼쪽, 빨간색) */}
                  <div
                    className="absolute top-0 left-0 h-4 bg-red-400 rounded-l"
                    style={{ width: `${100 - percent}%` }}
                  />
                  {/* 좋아요(오른쪽, 초록색) */}
                  <div
                    className="absolute top-0 right-0 h-4 bg-green-400 rounded-r"
                    style={{ width: `${percent}%` }}
                  />
                  {/* 싫어요 아이콘 */}
                  {dislike > 0 && (
                    <div className="absolute left-0 -translate-x-1/2 flex items-center h-4">
                      <span className="text-xs">👎{dislike}</span>
                    </div>
                  )}
                  {/* 좋아요 아이콘 */}
                  {like > 0 && (
                    <div className="absolute right-0 translate-x-1/2 flex items-center h-4">
                      <span className="text-xs">👍{like}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
