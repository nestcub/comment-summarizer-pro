import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { ThumbsUp, MessageCircle, Youtube, Loader, Search } from "lucide-react";
import { useState } from "react";

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
  onDetailedAnalysis: () => void;
  isLoading?: boolean;
  isSummarizing?: boolean;
  isAnalyzing?: boolean;
}

export const VideoPreview = ({ 
  videoData, 
  onSummarize, 
  onDetailedAnalysis,
  isLoading, 
  isSummarizing,
  isAnalyzing 
}: VideoPreviewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  if (!videoData && !isLoading) return null;

  const filteredComments = videoData?.comments.filter(comment => 
    comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-card rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="w-full h-[400px] flex flex-col items-center justify-center gap-4 bg-muted/50">
          <Youtube className="w-16 h-16 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading video details...</p>
        </div>
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
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {filteredComments?.map((comment) => (
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
              <div className="mt-6 space-y-3">
                <Button
                  onClick={onSummarize}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  size="lg"
                  disabled={isSummarizing}
                >
                  {isSummarizing ? (
                    <>
                      <Loader className="animate-spin" />
                      Summarizing Comments...
                    </>
                  ) : (
                    'Summarize Comments'
                  )}
                </Button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};