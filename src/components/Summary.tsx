import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import ReactMarkdown from 'react-markdown';

interface SummaryProps {
  summary?: string;
  isLoading?: boolean;
}

export const Summary = ({ summary, isLoading }: SummaryProps) => {
  if (!summary && !isLoading) return null;

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 p-6">
      <h3 className="text-xl font-semibold mb-4">Summary</h3>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
        </div>
      ) : (
        <ScrollArea className="h-[200px] rounded-md">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{summary || ""}</ReactMarkdown>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};