import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import ReactMarkdown from 'react-markdown';

interface SummaryProps {
  summary?: string;
  isLoading?: boolean;
}

export const Summary = ({ summary, isLoading }: SummaryProps) => {
  if (!summary && !isLoading) return null;

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8 bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-900/10 shadow-xl">
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">Summary</h3>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>
        ) : (
          <div className="prose prose-red max-w-none dark:prose-invert">
            <ReactMarkdown 
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 text-red-500 dark:text-red-500" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-red-600 dark:text-red-400" {...props} />,
              }}
            >
              {summary || ""}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </Card>
  );
};