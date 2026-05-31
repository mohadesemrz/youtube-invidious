'use client';

import { useState } from 'react';

export default function Home() {
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadVideo = async () => {
    if (!videoId.trim()) return;

    setLoading(true);
    setError('');
    setVideoUrl('');

    try {
      // دریافت اطلاعات از API خودت (نه مستقیم)
      const response = await fetch(`/api/proxy?videoId=${videoId}`);
      const data = await response.json();

      if (data.videoStreams && data.videoStreams.length > 0) {
        // پیدا کردن بهترین کیفیت
        const bestQuality = data.videoStreams.find((s: any) => 
          s.quality === '720p' || s.quality === '480p' || s.quality === '360p'
        );
        setVideoUrl(bestQuality?.url || data.videoStreams[0].url);
      } else {
        setError('ویدیو یافت نشد');
      }
    } catch (err) {
      setError('خطا در دریافت ویدیو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#ff0000' }}>🎬 پخش ویدیو</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="آیدی ویدیو..."
          style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
        />
        <button
          onClick={loadVideo}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'در حال دریافت...' : '▶ پخش'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      {videoUrl && (
        <video
          controls
          autoPlay
          style={{ width: '100%', borderRadius: '12px' }}
          src={videoUrl}
        />
      )}

      <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        آیدی نمونه: dQw4w9WgXcQ
      </p>
    </div>
  );
}