// app/api/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const videoId = searchParams.get('videoId');

  // اگر videoId داریم، کیفیت‌های ویدیو را برگردان
  if (videoId) {
    try {
      const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
      
      const qualities = info.formats
        .filter(f => f.hasVideo && f.hasAudio && f.qualityLabel)
        .map(f => f.qualityLabel)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => parseInt(a) - parseInt(b));
      
      return NextResponse.json({ qualities });
    } catch (error) {
      return NextResponse.json({ error: 'خطا در دریافت کیفیت‌ها' }, { status: 500 });
    }
  }

  // اگر query داریم، جستجو کن
  if (!query) {
    return NextResponse.json({ error: 'لطفاً عبارت جستجو را وارد کنید' }, { status: 400 });
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key تنظیم نشده است' }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data.items });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ارتباط با سرور' }, { status: 500 });
  }
}