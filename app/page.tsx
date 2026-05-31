// app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { YouTubeSearchItem } from '@/types/youtube';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const searchVideos = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setVideos(data.items || []);
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // ✅ تابع باز کردن ویدیو در صفحه جدید
  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#ff0000' }}>🎬 جستجوی یوتیوب</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          placeholder="جستجو..."
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
          }}
        />
        <button
          onClick={searchVideos}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'جستجو...' : '🔍 جستجو'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      <div>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            onClick={() => openVideo(video.id.videoId)}  // ✅ کلیک = باز شدن ویدیو
            style={{
              display: 'flex',
              gap: '16px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              style={{ width: '160px', height: '90px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{video.snippet.title}</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{video.snippet.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}