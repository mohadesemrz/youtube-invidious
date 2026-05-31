// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoUrl = searchParams.get('url');
  const quality = searchParams.get('quality') || '720p'; // دریافت کیفیت از پارامتر

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL ویدیو را وارد کنید' }, { status: 400 });
  }

  if (!ytdl.validateURL(videoUrl)) {
    return NextResponse.json({ error: 'لینک یوتیوب معتبر نیست' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    
    // ✅ انتخاب کیفیت 720p
    let format;
    
    if (quality === '720p') {
      // فرمت‌های با کیفیت 720p (codec h264 برای پخش در اکثر دستگاه‌ها)
      format = ytdl.chooseFormat(info.formats, { 
        quality: '18',  // 360p
        filter: 'audioandvideo' 
      });
      
      // پیدا کردن فرمت 720p به صورت دستی
      const format720p = info.formats.find(f => 
        f.qualityLabel === '720p' && 
        f.hasVideo && 
        f.hasAudio &&
        f.container === 'mp4'
      );
      
      if (format720p) {
        format = format720p;
      } else {
        // اگر 720p نبود، بهترین کیفیت موجود رو بگیر
        format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
      }
    } else {
      format = ytdl.chooseFormat(info.formats, { quality: '18' });
    }
    
    const headers = {
      'Content-Disposition': `attachment; filename="${info.videoDetails.title}.mp4"`,
      'Content-Type': 'video/mp4',
    };

    const stream = ytdl(videoUrl, { format });
    
    return new NextResponse(stream as any, { headers });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'خطا در دانلود ویدیو' }, { status: 500 });
  }
}