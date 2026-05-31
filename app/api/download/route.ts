// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoUrl = searchParams.get('url');
  const action = searchParams.get('action'); // 'stream' or 'download'

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL ویدیو را وارد کنید' }, { status: 400 });
  }

  if (!ytdl.validateURL(videoUrl)) {
    return NextResponse.json({ error: 'لینک یوتیوب معتبر نیست' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    
    // پیدا کردن بهترین کیفیت موجود (با صدا)
    const format = info.formats.find(f => 
      f.hasVideo && f.hasAudio && f.qualityLabel === '360p'
    ) || info.formats.find(f => f.hasVideo && f.hasAudio);

    if (!format) {
      return NextResponse.json({ error: 'فرمت مناسبی یافت نشد' }, { status: 404 });
    }

    // برای استریم یا دانلود
    if (action === 'stream') {
      const stream = ytdl(videoUrl, { format });
      return new NextResponse(stream as any, {
        headers: {
          'Content-Type': 'video/mp4',
          'Cache-Control': 'no-cache',
        },
      });
    } else {
      const stream = ytdl(videoUrl, { format });
      return new NextResponse(stream as any, {
        headers: {
          'Content-Disposition': `attachment; filename="${info.videoDetails.title}.mp4"`,
          'Content-Type': 'video/mp4',
        },
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'خطا در پردازش ویدیو' }, { status: 500 });
  }
}