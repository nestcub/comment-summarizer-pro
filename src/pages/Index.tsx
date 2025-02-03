import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Clear data only when there's no preserveData flag in location state
  useEffect(() => {
    if (!location.state?.preserveData) {
      setVideoData(null);
      setSummary("");
    }
  }, [location]);

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

  const handleDetailedAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: { 
          videoUrl: "", 
          getDetailedAnalysis: true, 
          comments: videoData?.comments 
        }
      });

      if (error) throw error;
      navigate('/detailed-analysis', { state: { analysis: data.analysis } });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate detailed analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen youtube-gradient py-12 px-4">
      <YouTubeInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
      <VideoPreview
        videoData={videoData ?? undefined}
        onSummarize={handleSummarize}
        onDetailedAnalysis={handleDetailedAnalysis}
        isLoading={isLoading}
        isSummarizing={isSummarizing}
        isAnalyzing={isAnalyzing}
      />
      <Summary
        summary={summary}
        isLoading={isSummarizing || isAnalyzing}
      />
    </div>
  );
};

export default Index;