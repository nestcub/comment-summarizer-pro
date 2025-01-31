import { useState } from "react";
import { YouTubeInput } from "@/components/YouTubeInput";
import { VideoPreview } from "@/components/VideoPreview";
import { Summary } from "@/components/Summary";
import { useToast } from "@/components/ui/use-toast";

// Temporary mock data for UI development
const MOCK_VIDEO_DATA = {
  title: "Sample Video Title",
  thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  likes: 1500000,
  commentCount: 25000,
  comments: [
    {
      id: "1",
      text: "This is an amazing video! Really helped me understand the concept better.",
      author: "John Doe",
      likes: 1200
    },
    {
      id: "2",
      text: "Great explanation, but I have a question about the middle part.",
      author: "Jane Smith",
      likes: 800
    },
    // Add more mock comments as needed
  ]
};

const Index = () => {
  const [videoData, setVideoData] = useState<typeof MOCK_VIDEO_DATA | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVideoData(MOCK_VIDEO_DATA);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load video data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSummary("This is a mock summary of the video comments. The general sentiment is positive, with many users expressing appreciation for the content. Common themes include:\n\n- Clear explanations\n- Helpful examples\n- Good production quality\n\nSome users had questions about specific parts, but overall the response was very positive.");
    } catch (error) {
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
      />
      <Summary
        summary={summary}
        isLoading={isSummarizing}
      />
    </div>
  );
};

export default Index;