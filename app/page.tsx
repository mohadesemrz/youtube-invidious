// app/page.tsx
'use client';

import { useState } from 'react';
import { YouTubeSearchItem } from '@/types/youtube';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedQualities, setSelectedQualities] = useState<{ [key: string]: string }>({});

  // کیفیت‌های موجود
  const qualities = [
    { label: '144p', value: '144p' },
    { label: '240p', value: '240p' },
    { label: '360p', value: '360p' },
    { label: '480p', value: '480p' },
    { label: '720p', value: '720p' },
    { label: '1080p', value: '1080p' },
  ];

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
        // تنظیم کیفیت پیش‌فرض برای هر ویدیو
        const defaultQualities: { [key: string]: string } = {};
        data.items?.forEach((video: YouTubeSearchItem) => {
          defaultQualities[video.id.videoId] = '720p';
        });
        setSelectedQualities(defaultQualities);
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleQualityChange = (videoId: string, quality: string) => {
    setSelectedQualities(prev => ({
      ...prev,
      [videoId]: quality
    }));
  };

  const downloadVideo = async (videoId: string, title: string) => {
    setDownloading(videoId);
    
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const quality = selectedQualities[videoId] || '720p';
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(videoUrl)}&quality=${quality}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/[^\w\u0600-\u06FF]/g, '_')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('خطا در دانلود ویدیو. ممکن است کیفیت انتخابی در دسترس نباشد.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#ff0000',
        marginBottom: '30px',
        fontSize: '2rem'
      }}>
        🎬 جستجو و دانلود یوتیوب
      </h1>

      {/* باکس جستجو */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchVideos()}
          placeholder="عبارت جستجو را وارد کنید..."
          style={{
            flex: 1,
            padding: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s',
            minWidth: '200px',
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff0000'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <button
          onClick={searchVideos}
          disabled={loading}
          style={{
            padding: '14px 32px',
            backgroundColor: '#ff0000',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ جستجو...' : '🔍 جستجو'}
        </button>
      </div>

      {/* خطاها */}
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ❌ {error}
        </div>
      )}

      {/* لیست ویدیوها */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div>⏳ در حال بارگذاری ویدیوها...</div>
        </div>
      )}

      <div>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            style={{
              display: 'flex',
              gap: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* تصویر بندانگشتی */}
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              style={{ 
                width: '180px', 
                height: '101px', 
                borderRadius: '12px', 
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank')}
            />
            
            {/* اطلاعات ویدیو */}
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px',
                cursor: 'pointer',
                color: '#1a1a1a'
              }}
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank')}>
                {video.snippet.title}
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
                {video.snippet.channelTitle}
              </p>
              <p style={{ margin: '0 0 16px 0', color: '#999', fontSize: '12px' }}>
                {new Date(video.snippet.publishedAt).toLocaleDateString('fa-IR')}
              </p>
              
              {/* کنترل‌های دانلود */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedQualities[video.id.videoId] || '720p'}
                  onChange={(e) => handleQualityChange(video.id.videoId, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  {qualities.map((q) => (
                    <option key={q.value} value={q.value}>
                      {q.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => downloadVideo(video.id.videoId, video.snippet.title)}
                  disabled={downloading === video.id.videoId}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: downloading === video.id.videoId ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: downloading === video.id.videoId ? 0.7 : 1,
                  }}
                >
                  <span>{downloading === video.id.videoId ? '⏳' : '⬇️'}</span>
                  {downloading === video.id.videoId ? 'در حال دانلود...' : 'دانلود'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* اگر ویدیویی وجود نداشت */}
      {!loading && videos.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          🎥 عبارتی را جستجو کنید تا ویدیوها نمایش داده شوند
        </div>
      )}

      {/* فوتر */}
      {videos.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          padding: '20px',
          color: '#999',
          fontSize: '12px',
          borderTop: '1px solid #e0e0e0'
        }}>
          ⚠️ دانلود ویدیوها فقط برای استفاده شخصی مجاز است
        </div>
      )}
    </div>
  );
}