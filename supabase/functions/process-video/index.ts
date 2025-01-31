import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request');
    const { videoUrl, getSummary, comments } = await req.json();
    
    // If getSummary is true, generate summary from provided comments
    if (getSummary && comments) {
      console.log('Generating summary for comments');
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze these YouTube comments and provide a comprehensive summary of the main points, sentiments, and recurring themes. Format the response in markdown with appropriate headers and bullet points:\n\n${comments.map(c => c.text).join('\n')}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return new Response(
        JSON.stringify({ summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise, fetch video data
    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    console.log('Fetching video data');
    // Extract video ID from URL
    let videoId;
    try {
      const url = new URL(videoUrl);
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else {
        const pathSegments = url.pathname.split('/');
        videoId = pathSegments[pathSegments.length - 1];
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      throw new Error('Invalid YouTube URL');
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    
    // Fetch video details
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items?.length) {
      throw new Error('Video not found');
    }

    // Fetch video comments
    const commentsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${apiKey}`
    );
    const commentsData = await commentsResponse.json();

    const processedData = {
      title: videoData.items[0].snippet.title,
      thumbnail: videoData.items[0].snippet.thumbnails.high.url,
      likes: parseInt(videoData.items[0].statistics.likeCount),
      commentCount: parseInt(videoData.items[0].statistics.commentCount),
      comments: commentsData.items.map((item: any) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: parseInt(item.snippet.topLevelComment.snippet.likeCount),
      })),
    };

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
