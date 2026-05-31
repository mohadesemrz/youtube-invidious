// app/page.tsx
'use client';

import { useState } from 'react';
import { YouTubeSearchItem } from '@/types/youtube';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeSearchItem | null>(null);

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
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // ✅ باز کردن پلیر
  const playVideo = (video: YouTubeSearchItem) => {
    setSelectedVideo(video);
  };

  // ✅ بستن پلیر
  const closePlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#ff0000' }}>🎬 جستجوی یوتیوب</h1>

      {/* باکس جستجو */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          placeholder="عبارت جستجو..."
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

      {/* لیست ویدیوها */}
      <div>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            onClick={() => playVideo(video)}
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

      {/* ✅ پلیر ویدیو (Modal) - بدون هدایت به یوتیوب */}
      {selectedVideo && (
        <div
          onClick={closePlayer}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#000',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button
                onClick={closePlayer}
                style={{
                  background: '#ff0000',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                }}
              >
                ✕ بستن
              </button>
            </div>
            
            {/* ✅ iframe یوتیوب - ویدیو در همین صفحه پخش می‌شود */}
            <iframe
              width="900"
              height="506"
              src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={selectedVideo.snippet.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ borderRadius: '12px' }}
            />
            
            <div style={{ color: 'white', marginTop: '15px', padding: '0 10px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{selectedVideo.snippet.title}</h3>
              <p style={{ margin: '0', color: '#ccc', fontSize: '14px' }}>
                {selectedVideo.snippet.channelTitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}