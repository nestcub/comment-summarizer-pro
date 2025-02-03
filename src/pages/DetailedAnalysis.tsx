import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DetailedAnalysisProps {
  analysis?: string;
}

const DetailedAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const analysis = location.state?.analysis as string;

  // Mock data for sentiment distribution chart
  const sentimentData = [
    { name: 'Positive', count: 45 },
    { name: 'Neutral', count: 30 },
    { name: 'Negative', count: 25 },
  ];

  const filteredAnalysis = analysis
    ? analysis.split('\n').filter(line => 
        line.toLowerCase().includes(searchQuery.toLowerCase())
      ).join('\n')
    : "";

  if (!analysis) {
    return (
      <div className="min-h-screen youtube-gradient py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Analysis Available</h2>
          <p className="mb-4">Please generate an analysis from the main page first.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen youtube-gradient py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
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
                  <ReactMarkdown>{filteredAnalysis}</ReactMarkdown>
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Column - Analytics Dashboard */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                  <p className="text-2xl font-bold">100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Sentiment</p>
                  <p className="text-2xl font-bold">Positive 😊</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Score</p>
                  <p className="text-2xl font-bold">8.5/10</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysis;