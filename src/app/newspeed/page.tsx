"use client";
import { useEffect, useRef, useState, TouchEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import NewsCard from "./NewsCard";

interface News {
  id: string;
  title: string;
  related: string;
  description: string;
  positive: string;
  negative: string;
}

const PAGE_SIZE = 10;

function getLocalLikes() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("news-likes") || "{}") as Record<
      string,
      "like" | "dislike"
    >;
  } catch {
    return {};
  }
}
function setLocalLikes(likes: Record<string, "like" | "dislike">) {
  localStorage.setItem("news-likes", JSON.stringify(likes));
}

export default function NewspeedPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likes, setLikes] = useState<Record<string, "like" | "dislike">>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pull to refresh 관련 상태
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;

  // 뉴스 불러오기
  const fetchNews = async (pageNum = 1, replace = false) => {
    if (replace) setRefreshing(true);
    else setLoading(true);
    const res = await fetch(`/api/news?page=${pageNum}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    setNews((prev) => (replace ? data.news : [...prev, ...data.news]));
    setHasMore(data.hasMore);
    setLoading(false);
    setRefreshing(false);
  };

  // 최초 로딩
  useEffect(() => {
    fetchNews(1, true);
    setPage(1);
    setLikes(getLocalLikes());
  }, []);

  // 무한 스크롤: 하단 도달 시 다음 페이지
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || loading || refreshing || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setLoading(true);
      fetchNews(page + 1).then(() => setPage((p) => p + 1));
    }
  };

  // Pull to refresh: 터치 시작
  const onTouchStart = (e: TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };
  // Pull to refresh: 터치 이동
  const onTouchMove = (e: TouchEvent) => {
    if (pullStart !== null) {
      const dist = e.touches[0].clientY - pullStart;
      if (dist > 0) setPullDistance(dist);
    }
  };
  // Pull to refresh: 터치 끝
  const onTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) {
      fetchNews(1, true);
      setPage(1);
    }
    setPullStart(null);
    setPullDistance(0);
  };

  // 좋아요/싫어요 핸들러
  const handleLike = (id: string) => {
    setLikes((prev) => {
      const newLikes = { ...prev };
      if (prev[id] === "like") {
        delete newLikes[id];
      } else {
        newLikes[id] = "like";
      }
      setLocalLikes(newLikes);
      return { ...newLikes };
    });
  };
  const handleDislike = (id: string) => {
    setLikes((prev) => {
      const newLikes = { ...prev };
      if (prev[id] === "dislike") {
        delete newLikes[id];
      } else {
        newLikes[id] = "dislike";
      }
      setLocalLikes(newLikes);
      return { ...newLikes };
    });
  };

  return (
    <div className="relative flex flex-col gap-4 w-full h-screen overflow-hidden">
      <div className="pt-12 w-full bg-background/50 backdrop-blur-lg z-10 px-2">
        <h1 className="text-2xl font-bold">뉴스 모아보기</h1>
      </div>
      <div
        ref={scrollRef}
        className="basis-0 grow shrink w-full overflow-y-auto scollbar-hide flex flex-col gap-2 relative px-2"
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Pull to refresh indicator */}
        <div
          style={{
            height: pullDistance > 0 ? pullDistance : 0,
            transition: pullStart ? "none" : "height 0.2s",
          }}
          className="flex items-center justify-center text-xs text-muted-foreground"
        >
          {pullDistance > PULL_THRESHOLD
            ? "새로고침!"
            : pullDistance > 0
            ? "아래로 당겨서 새로고침"
            : null}
        </div>
        {refreshing || (loading && news.length === 0)
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={i}
                className="rounded-lg h-32 w-full p-4 grow-0 shrink-0"
              />
            ))
          : news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                liked={likes[item.id] === "like"}
                disliked={likes[item.id] === "dislike"}
                onLike={() => handleLike(item.id)}
                onDislike={() => handleDislike(item.id)}
              />
            ))}
        {/* 하단 로딩 인디케이터 */}
        {loading && news.length > 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            불러오는 중...
          </div>
        )}
        {!hasMore && !loading && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            더 이상 뉴스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
