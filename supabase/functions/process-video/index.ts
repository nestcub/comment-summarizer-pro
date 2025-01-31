import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getVideoDetails(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  if (!data.items?.length) {
    throw new Error('Video not found');
  }
  return data.items[0];
}

async function getVideoComments(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  return data.items || [];
}

async function summarizeComments(comments: any[]) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const commentTexts = comments
    .map(comment => comment.snippet.topLevelComment.snippet.textDisplay)
    .join('\n\n');

  const prompt = `Analyze and summarize the following YouTube comments. Identify main themes, sentiments, and notable feedback. Format the summary in clear paragraphs:\n\n${commentTexts}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Processing video request');
    const { videoUrl } = await req.json();
    
    // Extract video ID from URL
    let videoId;
    try {
      const url = new URL(videoUrl);
      videoId = url.searchParams.get('v');
      if (!videoId) {
        const pathSegments = url.pathname.split('/');
        videoId = pathSegments[pathSegments.length - 1];
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      throw new Error('Invalid YouTube URL');
    }

    if (!videoId) {
      throw new Error('Could not extract video ID from URL');
    }

    console.log('Fetching data for video:', videoId);

    // Fetch video details and comments in parallel
    const [videoDetails, comments] = await Promise.all([
      getVideoDetails(videoId),
      getVideoComments(videoId)
    ]);

    console.log('Generating summary for', comments.length, 'comments');
    const summary = await summarizeComments(comments);

    const processedData = {
      title: videoDetails.snippet.title,
      thumbnail: videoDetails.snippet.thumbnails.maxres?.url || videoDetails.snippet.thumbnails.high.url,
      likes: parseInt(videoDetails.statistics.likeCount) || 0,
      commentCount: parseInt(videoDetails.statistics.commentCount) || 0,
      comments: comments.map((item: any) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: parseInt(item.snippet.topLevelComment.snippet.likeCount) || 0
      })),
      summary
    };

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});