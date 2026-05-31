// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL ویدیو را وارد کنید' }, { status: 400 });
  }

  if (!ytdl.validateURL(videoUrl)) {
    return NextResponse.json({ error: 'لینک یوتیوب معتبر نیست' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    
    // استخراج کیفیت‌های موجود
    const availableQualities = info.formats
      .filter(f => f.hasVideo && f.hasAudio && f.qualityLabel)
      .map(f => ({
        label: f.qualityLabel,
        itag: f.itag,
        container: f.container
      }))
      // حذف تکراری‌ها
      .filter((value, index, self) => 
        index === self.findIndex((t) => t.label === value.label)
      )
      // مرتب‌سازی از پایین به بالا
      .sort((a, b) => {
        const numA = parseInt(a.label) || 0;
        const numB = parseInt(b.label) || 0;
        return numA - numB;
      });

    // انتخاب بهترین کیفیت موجود (پایین‌ترین کیفیت به عنوان پیش‌فرض)
    const bestQuality = availableQualities[availableQualities.length - 1]?.itag;
    
    const format = ytdl.chooseFormat(info.formats, { 
      quality: bestQuality || '18'
    });
    
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