import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidYouTubeUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.hostname === 'www.youtube.com' || 
       parsedUrl.hostname === 'youtube.com' || 
       parsedUrl.hostname === 'youtu.be') &&
      (parsedUrl.pathname.includes('/watch') || 
       parsedUrl.hostname === 'youtu.be')
    );
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request');
    const { videoUrl, getSummary, getDetailedAnalysis, comments } = await req.json();
    
    // If getSummary or getDetailedAnalysis is true, generate analysis from provided comments
    if ((getSummary || getDetailedAnalysis) && comments) {
      console.log('Generating analysis for comments');
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      let prompt;
      if (getDetailedAnalysis) {
        prompt = `Analyze these YouTube comments and provide a detailed analysis with the following sections:

1. Sentiment Analysis & Emotion Detection:
- Overall sentiment score with emojis (😊 Positive | 😡 Negative | 😐 Neutral)
- Highlight the most emotionally intense comments with 🔥

2. Comment Categories:
- FAQ (Frequently Asked Questions)
- Praise
- Criticism
- Questions
- Suggestions

3. Top 3 Discussed Topics:
- List and briefly explain the most discussed subjects

4. Engagement Score:
- Rate the comment section's engagement level (1-10)
- Consider likes, discussion depth, and interaction quality

Format the response in markdown with appropriate headers and bullet points.

Comments to analyze:
${comments.map(c => c.text).join('\n')}`;
      } else {
        prompt = `Analyze these YouTube comments and provide a comprehensive summary of the main points, sentiments, and recurring themes. Format the response in markdown with appropriate headers and bullet points:\n\n${comments.map(c => c.text).join('\n')}`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return new Response(
        JSON.stringify({ 
          summary: getSummary ? analysis : undefined,
          analysis: getDetailedAnalysis ? analysis : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise, fetch video data
    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      throw new Error('Invalid YouTube URL. Please provide a valid YouTube video URL.');
    }

    console.log('Fetching video data for URL:', videoUrl);
    // Extract video ID from URL
    let videoId;
    try {
      const url = new URL(videoUrl);
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      } else {
        const urlParams = new URLSearchParams(url.search);
        videoId = urlParams.get('v');
      }

      if (!videoId) {
        throw new Error('Could not extract video ID from URL');
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      throw new Error('Invalid YouTube URL format');
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }
    
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

    if (!commentsData.items) {
      throw new Error('Could not fetch comments. Comments might be disabled for this video.');
    }

    const processedData = {
      title: videoData.items[0].snippet.title,
      thumbnail: videoData.items[0].snippet.thumbnails.high.url,
      likes: parseInt(videoData.items[0].statistics.likeCount) || 0,
      commentCount: parseInt(videoData.items[0].statistics.commentCount) || 0,
      comments: commentsData.items.map((item: any) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: parseInt(item.snippet.topLevelComment.snippet.likeCount) || 0,
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