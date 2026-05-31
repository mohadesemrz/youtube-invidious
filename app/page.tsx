'use client';

import { useState } from 'react';

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
  const [downloading, setDownloading] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{ [key: string]: string[] }>({});
  const [selectedQuality, setSelectedQuality] = useState<{ [key: string]: string }>({});

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

  const getQualities = async (videoId: string) => {
    if (qualities[videoId]) return;

    try {
      const response = await fetch(`/api/youtube?videoId=${videoId}`);
      const data = await response.json();
      
      if (data.qualities) {
        setQualities(prev => ({ ...prev, [videoId]: data.qualities }));
        // تنظیم پیش‌فرض روی بهترین کیفیت
        const bestQuality = data.qualities[data.qualities.length - 1];
        setSelectedQuality(prev => ({ ...prev, [videoId]: bestQuality }));
      }
    } catch (error) {
      console.error('Error fetching qualities:', error);
    }
  };

  const downloadVideo = async (videoId: string, title: string) => {
    const quality = selectedQuality[videoId];
    if (!quality) {
      alert('لطفاً ابتدا کیفیت را انتخاب کنید');
      return;
    }

    setDownloading(videoId);
    
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(videoUrl)}&quality=${quality}`
      );
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
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
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#ff0000' }}>🎬 جستجو و دانلود یوتیوب</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          placeholder="جستجو..."
          style={{ flex: 1, padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
        />
        <button
          onClick={searchVideos}
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#ff0000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'جستجو...' : '🔍 جستجو'}
        </button>
      </div>

      {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>❌ {error}</div>}

      <div>
        {videos.map((video) => (
          <div key={video.id.videoId} style={{ display: 'flex', gap: '16px', border: '1px solid #ddd', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}
            onMouseEnter={() => getQualities(video.id.videoId)}>
            <img src={video.snippet.thumbnails.medium.url} alt="" style={{ width: '160px', height: '90px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <h3>{video.snippet.title}</h3>
              <p>{video.snippet.channelTitle}</p>
              
              {qualities[video.id.videoId] && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                  <select
                    value={selectedQuality[video.id.videoId] || ''}
                    onChange={(e) => setSelectedQuality(prev => ({ ...prev, [video.id.videoId]: e.target.value }))}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                  >
                    {qualities[video.id.videoId].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => downloadVideo(video.id.videoId, video.snippet.title)}
                    disabled={downloading === video.id.videoId}
                    style={{ padding: '6px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {downloading === video.id.videoId ? '⏳...' : '⬇️ دانلود'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}