export const formatLiveRelativeTime = (isoOrDate?: string | Date): string => {
  if (!isoOrDate) return 'Just now';
  const time = new Date(isoOrDate).getTime();
  if (isNaN(time)) {
    return typeof isoOrDate === 'string' ? isoOrDate : 'Just now';
  }
  const diffMs = Math.max(0, Date.now() - time);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

