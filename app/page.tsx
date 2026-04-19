// app/components/YoutubePlayer.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

// تعریف تایپ برای YouTube Player
interface YouTubePlayer {
  loadVideoById(videoId: string): void;
  destroy(): void;
}

// تعریف تایپ برای YT object موجود در window
interface YTWindow extends Window {
  YT: {
    Player: new (
      elementId: string,
      options: {
        height: string;
        width: string;
        videoId: string;
        events: {
          onReady: (event: { target: YouTubePlayer }) => void;
        };
      }
    ) => YouTubePlayer;
    PlayerState?: {
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
}

export default function YoutubePlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [videoId, setVideoId] = useState<string>('');
  const [isApiLoaded, setIsApiLoaded] = useState<boolean>(false);
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    // بررسی اینکه آیا API قبلاً لود شده
    if (typeof window !== 'undefined' && (window as unknown as YTWindow).YT) {
      initializePlayer();
      return;
    }

    // بارگذاری API یوتیوب
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // تعریف تابع global برای زمان آماده شدن API
    (window as unknown as YTWindow).onYouTubeIframeAPIReady = () => {
      setIsApiLoaded(true);
      initializePlayer();
    };

    return () => {
      // پاکسازی پلیر هنگام unmount
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      // پاک کردن تابع global
      delete (window as unknown as YTWindow).onYouTubeIframeAPIReady;
    };
  }, []);

  const initializePlayer = () => {
    const yt = (window as unknown as YTWindow).YT;
    if (!yt || !yt.Player) {
      console.error('YouTube API not loaded');
      return;
    }

    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) return;

    try {
      const newPlayer = new yt.Player('youtube-player', {
        height: '390',
        width: '640',
        videoId: 'dQw4w9WgXcQ',
        events: {
          onReady: (event) => {
            console.log('Player ready');
            playerRef.current = event.target;
            setPlayer(event.target);
          },
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  const playVideo = () => {
    if (playerRef.current && videoId.trim() !== '') {
      playerRef.current.loadVideoById(videoId);
    } else if (!playerRef.current) {
      console.warn('Player not initialized yet');
    } else if (videoId.trim() === '') {
      console.warn('Please enter a video ID');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      playVideo();
    }
  };

  // مثال از videoId های معروف یوتیوب
  const exampleVideoIds = [
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
    { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE' },
    { id: '3JZ_D3ELwOQ', title: 'Baby Shark Dance' },
  ];

  const loadExampleVideo = (id: string) => {
    setVideoId(id);
    if (playerRef.current) {
      playerRef.current.loadVideoById(id);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div 
          id="youtube-player" 
          className="w-full aspect-video bg-black"
        />
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="آیدی ویدیو یوتیوب را وارد کنید (مثال: dQw4w9WgXcQ)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            dir="ltr"
          />
          <button 
            onClick={playVideo}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            disabled={!videoId.trim()}
          >
            پخش ویدیو
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-2">🎬 مثال‌ها:</p>
          <div className="flex flex-wrap gap-2">
            {exampleVideoIds.map((example) => (
              <button
                key={example.id}
                onClick={() => loadExampleVideo(example.id)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs transition-colors"
              >
                {example.title.length > 30 ? example.title.substring(0, 30) + '...' : example.title}
              </button>
            ))}
          </div>
        </div>

        {!isApiLoaded && (
          <div className="text-center text-gray-500 text-sm">
            در حال بارگذاری پلیر یوتیوب...
          </div>
        )}
      </div>
    </div>
  );
}