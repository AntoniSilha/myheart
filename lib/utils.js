export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getDaysTogether(anniversaryDate) {
  if (!anniversaryDate) return 0;
  const start = new Date(anniversaryDate);
  const now = new Date();
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getMediaType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  return videoExts.includes(ext) ? 'video' : 'image';
}
