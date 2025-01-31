import { useState } from "react";
import { YouTubeInput } from "@/components/YouTubeInput";
import { VideoPreview } from "@/components/VideoPreview";
import { Summary } from "@/components/Summary";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoData {
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
  summary: string;
}

const Index = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { videoUrl: url }
      });

      if (error) throw error;
      setVideoData(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load video data. Please try again.",
        variant: "destructive",
      });
      setVideoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen youtube-gradient py-12 px-4">
      <YouTubeInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
      <VideoPreview
        videoData={videoData ?? undefined}
        onSummarize={() => {}}
        isLoading={isLoading}
      />
      <Summary
        summary={videoData?.summary}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;