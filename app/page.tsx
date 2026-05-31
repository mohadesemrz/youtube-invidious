// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const loadVideo = async () => {
    setError('');
    
    try {
      // استفاده از API های عمومی (ناپایدار)
      const apiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.videoStreams && data.videoStreams.length > 0) {
        setVideoUrl(data.videoStreams[0].url);
      }
    } catch {
      setError('خطا در دریافت ویدیو. ممکن است سرویس موقتاً در دسترس نباشد.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎬 پخش ویدیو</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="آیدی ویدیو یوتیوب..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={loadVideo} style={{ padding: '8px 16px' }}>
          پخش
        </button>
      </div>
      
      {error && <div style={{ color: 'red' }}>❌ {error}</div>}
      
      {videoUrl && (
        <video controls style={{ width: '100%', maxWidth: '800px' }}>
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      
      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        ⚠️ به دلیل محدودیت‌ها، ممکن است این سرویس همیشه کار نکند.
        برای راه‌حل پایدار، از VPS یا ابرآروان استفاده کنید.
      </p>
    </div>
  );
}