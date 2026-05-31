// types/youtube.ts
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
}

export interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}

export interface YouTubeVideoId {
  kind: string;
  videoId: string;
}

export interface YouTubeSearchItem {
  kind: string;
  etag: string;
  id: YouTubeVideoId;
  snippet: YouTubeSnippet;
}

export interface YouTubeApiResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

export interface SearchParams {
  q: string;
  maxResults?: number;
  pageToken?: string;
}

export interface VideoCardProps {
  video: YouTubeSearchItem;
  onClick: (videoId: string) => void;
}
// types/youtube.ts
// ... تایپ‌های قبلی ...

export interface DownloadQuality {
  label: string;
  value: string;
}

export const QUALITIES: DownloadQuality[] = [
  { label: '144p', value: '144p' },
  { label: '240p', value: '240p' },
  { label: '360p', value: '360p' },
  { label: '480p', value: '480p' },
  { label: '720p', value: '720p' },
  { label: '1080p', value: '1080p' },
];