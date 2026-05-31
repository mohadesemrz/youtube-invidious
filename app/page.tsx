// app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { YouTubeSearchItem } from '@/types/youtube';

interface SearchResponse {
  success: boolean;
  items: YouTubeSearchItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  error?: string;
}

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [nextPageToken, setNextPageToken] = useState<string>('');
  const [prevPageToken, setPrevPageToken] = useState<string>('');

  const searchVideos = async (pageToken?: string) => {
    if (!query.trim()) {
      setError('لطفاً عبارت جستجو را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `/api/youtube?q=${encodeURIComponent(query)}&maxResults=10${
        pageToken ? `&pageToken=${pageToken}` : ''
      }`;

      const response = await fetch(url);
      const data: SearchResponse = await response.json();

      if (data.error) {
        setError(data.error);
        setVideos([]);
      } else if (data.items) {
        setVideos(data.items);
        setNextPageToken(data.nextPageToken || '');
        setPrevPageToken(data.prevPageToken || '');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchVideos();
  };

  const openVideo = (videoId: string) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: '#ff0000',
          marginBottom: '30px',
        }}
      >
        🎬 جستجوی یوتیوب
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عبارت جستجو را وارد کنید..."
            style={{
              flex: 1,
              padding: '14px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#ff0000')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />
          <button
            type="submit"
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
            {loading ? '⏳ ...' : '🔍 جستجو'}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          ❌ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div>⏳ در حال بارگذاری...</div>
        </div>
      )}

      <div>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            onClick={() => openVideo(video.id.videoId)}
            style={{
              display: 'flex',
              gap: '16px',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              style={{
                width: '160px',
                height: '90px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  lineHeight: '1.4',
                }}
              >
                {video.snippet.title}
              </h3>
              <p
                style={{
                  margin: '0 0 4px 0',
                  color: '#666',
                  fontSize: '14px',
                }}
              >
                {video.snippet.channelTitle}
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#999',
                  fontSize: '12px',
                }}
              >
                {new Date(video.snippet.publishedAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(nextPageToken || prevPageToken) && videos.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          {prevPageToken && (
            <button
              onClick={() => searchVideos(prevPageToken)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ← قبلی
            </button>
          )}
          {nextPageToken && (
            <button
              onClick={() => searchVideos(nextPageToken)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              بعدی →
            </button>
          )}
        </div>
      )}
    </div>
  );
}