import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Youtube, Loader } from "lucide-react";

interface YouTubeInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export const YouTubeInput = ({ onSubmit, isLoading }: YouTubeInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Youtube className={`w-8 h-8 text-primary ${isLoading ? 'animate-spin' : ''}`} />
        <h1 className="text-2xl font-bold">YouTube Comment Summarizer</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter YouTube video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          required
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="animate-spin" />
              Loading...
            </>
          ) : (
            'Load Video'
          )}
        </Button>
      </form>
    </div>
  );
};