import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import ReactWordcloud from 'react-wordcloud';

interface DetailedAnalysisProps {
  analysis?: string;
}

const DetailedAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const analysis = location.state?.analysis as string;

  // Mock data for word cloud
  const words = [
    { text: 'amazing', value: 64 },
    { text: 'helpful', value: 42 },
    { text: 'great', value: 38 },
    { text: 'content', value: 30 },
    { text: 'quality', value: 28 },
    { text: 'thanks', value: 25 },
    { text: 'awesome', value: 22 },
    { text: 'learn', value: 20 },
    { text: 'explanation', value: 18 },
    { text: 'tutorial', value: 15 },
  ];

  const wordcloudOptions = {
    rotations: 2,
    rotationAngles: [-90, 0] as [number, number],
    fontSizes: [20, 60] as [number, number],
    padding: 5,
  };

  const filteredAnalysis = analysis
    ? analysis.split('\n').filter(line => 
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join('\n')
    : "";

  const handleBack = () => {
    navigate('/', { state: { preserveData: true } });
  };

  if (!analysis) {
    return (
      <div className="min-h-screen youtube-gradient py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Analysis Available</h2>
          <p className="mb-4">Please generate an analysis from the main page first.</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const components = {
    p: ({ children }) => {
      // Add bold styling to category headers
      const text = children?.toString() || '';
      if (text.includes('FAQ:') || text.includes('Praise:') || text.includes('Criticism:') || 
          text.includes('Questions:') || text.includes('Suggestions:')) {
        return <p className="font-bold text-lg mt-6 mb-3">{children}</p>;
      }
      return <p className="mb-2">{children}</p>;
    },
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
  };

  return (
    <div className="min-h-screen youtube-gradient py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Video
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Search and Analysis */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in analysis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[600px]">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown components={components}>{filteredAnalysis}</ReactMarkdown>
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Column - Word Cloud */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Most Discussed Words</h3>
              <div className="h-[400px]">
                <ReactWordcloud words={words} options={wordcloudOptions} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;