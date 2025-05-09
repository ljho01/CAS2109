interface NewsCardProps {
  news: {
    id: string;
    title: string;
    related: string;
    description: string;
    positive: string;
    negative: string;
  };
  liked: boolean;
  disliked: boolean;
  onLike: () => void;
  onDislike: () => void;
}

export default function NewsCard({
  news,
  liked,
  disliked,
  onLike,
  onDislike,
}: NewsCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-xl w-full flex flex-col justify-center grow-0 shrink-0 p-2">
      <div className="font-bold text-lg mb-1 pt-2 pl-2">{news.title}</div>
      <div className="text-xs text-muted-foreground mb-1 pl-2">
        {news.related}
      </div>
      <div className="text-sm line-clamp-4 mb-1 px-2">{news.description}</div>
      <div
        className="flex gap-2 text-sm mt-1 items-center bg-green-500/10 data-[selected=true]:bg-green-500/80 data-[selected=true]:text-white p-2 rounded-md transition-all duration-100"
        onClick={onLike}
        data-selected={liked}
      >
        <span>{news.positive}</span>
      </div>
      <div
        className="flex gap-2 text-sm mt-1 items-center bg-red-500/10 data-[selected=true]:bg-red-500/80 data-[selected=true]:text-white p-2 rounded-md transition-all duration-100"
        onClick={onDislike}
        data-selected={disliked}
      >
        <span>{news.negative}</span>
      </div>
    </div>
  );
}
