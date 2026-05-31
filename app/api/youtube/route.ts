// app/api/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { YouTubeApiResponse } from '@/types/youtube';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const maxResults = searchParams.get('maxResults') || '10';
  const pageToken = searchParams.get('pageToken') || '';

  if (!query) {
    return NextResponse.json(
      { error: 'لطفاً عبارت جستجو را وارد کنید' },
      { status: 400 }
    );
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API Key تنظیم نشده است' },
      { status: 500 }
    );
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(
      query
    )}&type=video&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;

    const response = await fetch(url);
    const data: YouTubeApiResponse = await response.json();

    if ('error' in data) {
      return NextResponse.json(
        { error: (data as any).error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: data.items,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken,
      pageInfo: data.pageInfo,
    });
  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { error: 'مشکل در ارتباط با سرور' },
      { status: 500 }
    );
  }
}