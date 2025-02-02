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
}

const Index = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { videoUrl: url, getSummary: false }
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

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { videoUrl: "", getSummary: true, comments: videoData?.comments }
      });

      if (error) throw error;
      setSummary(data.summary);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen youtube-gradient py-12 px-4">
      <YouTubeInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
      <VideoPreview
        videoData={videoData ?? undefined}
        onSummarize={handleSummarize}
        isLoading={isLoading}
        isSummarizing={isSummarizing}
      />
      <Summary
        summary={summary}
        isLoading={isSummarizing}
      />
    </div>
  );
};

export default Index;