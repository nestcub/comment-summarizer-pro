import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { ThumbsUp, MessageCircle } from "lucide-react";

interface VideoPreviewProps {
  videoData?: {
    title: string;
    thumbnail: string;
    likes: number;
    commentCount: number;
    comments: Array<{
      id: string;
      text: string;
      author: string;
      likes: number;
    }>;
  };
  onSummarize: () => void;
  isLoading?: boolean;
}

export const VideoPreview = ({ videoData, onSummarize, isLoading }: VideoPreviewProps) => {
  if (!videoData && !isLoading) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-card rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <Skeleton className="w-full h-[200px]" />
      ) : (
        videoData && (
          <>
            <div className="aspect-video relative">
              <img
                src={videoData.thumbnail}
                alt={videoData.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{videoData.title}</h2>
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  <span>{videoData.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>{videoData.commentCount.toLocaleString()}</span>
                </div>
              </div>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {videoData.comments.map((comment) => (
                  <div key={comment.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{comment.author}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                ))}
              </ScrollArea>
              <div className="mt-6">
                <Button
                  onClick={onSummarize}
                  className="w-full"
                  size="lg"
                >
                  Summarize Comments
                </Button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};