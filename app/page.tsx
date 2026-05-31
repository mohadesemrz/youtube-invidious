'use client';

import { useState, useRef } from 'react';

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
  };
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const playVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

  const downloadVideo = async (videoId: string, title: string) => {
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(`/api/download?url=${encodeURIComponent(videoUrl)}&action=download`);
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert('خطا در دانلود ویدیو');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
            style={{
              display: 'flex',
              gap: '16px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fff',
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              style={{ width: '160px', height: '90px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={() => playVideo(video)}
            />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{video.snippet.title}</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>{video.snippet.channelTitle}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => playVideo(video)}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ▶ پخش
                </button>
                <button
                  onClick={() => downloadVideo(video.id.videoId, video.snippet.title)}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ⬇ دانلود
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* پلیر ویدیو (استریم مستقیم) */}
      {selectedVideo && isPlaying && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: 'white', margin: 0 }}>{selectedVideo.snippet.title}</h3>
              <button
                onClick={closePlayer}
                style={{
                  background: '#ff0000',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                }}
              >
                ✕ بستن
              </button>
            </div>
            
            {/* ویدیو پلیر HTML5 */}
            <video
              ref={videoRef}
              controls
              autoPlay
              style={{
                width: '800px',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '12px',
              }}
              src={`/api/download?url=https://www.youtube.com/watch?v=${selectedVideo.id.videoId}&action=stream`}
            />
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => downloadVideo(selectedVideo.id.videoId, selectedVideo.snippet.title)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                ⬇ دانلود ویدیو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}