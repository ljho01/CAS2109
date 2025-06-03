import { useState, useEffect } from "react";

export function usePodcast(eventId: string | null, locale: string = "ko") {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setIsAvailable(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    // HEAD 요청으로 팟캐스트 파일 존재 여부 확인 (locale 포함)
    fetch(`/api/podcast/${eventId}?locale=${locale}`, { method: "HEAD" })
      .then((response) => {
        if (isMounted) {
          setIsAvailable(response.ok);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAvailable(false);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, locale]); // locale을 의존성에 추가

  return { isAvailable, isLoading };
}
