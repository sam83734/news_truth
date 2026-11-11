export function getYouTubeVideoId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  // Matches:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://m.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/live/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&rel=0`;
}

export function getYouTubeThumbnail(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function isVideoSource(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:video/')) return true;
  if (/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(trimmed)) return true;
  if (getYouTubeVideoId(trimmed) !== null) return true;
  return false;
}

export function getArticleMediaInfo(article: {
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: string;
}) {
  const rawVideo =
    article.videoUrl || (isVideoSource(article.imageUrl) ? article.imageUrl : '');
  const isVideo = Boolean(rawVideo || article.mediaType === 'video');
  const ytEmbedUrl = isVideo ? getYouTubeEmbedUrl(rawVideo) : null;
  const ytThumb = isVideo ? getYouTubeThumbnail(rawVideo) : null;

  let displayImage = article.imageUrl || '';
  if (isVideo) {
    if (ytThumb) {
      displayImage = ytThumb;
    } else if (
      displayImage.startsWith('data:video/') ||
      /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(displayImage)
    ) {
      displayImage = '';
    }
  }

  return {
    isVideo,
    isYouTube: Boolean(ytEmbedUrl),
    ytEmbedUrl,
    videoSrc: rawVideo || '',
    displayImage,
  };
}

