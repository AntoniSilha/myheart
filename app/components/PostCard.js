import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import styles from './PostCard.module.css';

export default function PostCard({ post, variant = 'regular' }) {
  const albumColor = post.albums?.color || '#ff6b9d';
  const albumName = post.albums?.name || 'Uncategorized';

  const variantClass = {
    featured: styles.cardFeatured,
    regular: styles.cardRegular,
    tall: styles.cardTall,
  }[variant] || styles.cardRegular;

  return (
    <Link href={`/post/${post.id}`}>
      <article className={`${styles.card} ${variantClass}`}>
        <div className={styles.imageWrapper}>
          {post.media_url && post.media_type === 'image' ? (
            <img
              src={post.media_url}
              alt={post.caption || 'Memory'}
              loading="lazy"
            />
          ) : post.media_url && post.media_type === 'video' ? (
            <>
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt={post.caption || 'Memory'}
                  loading="lazy"
                />
              ) : (
                <div className={styles.imageFallback}>🎬</div>
              )}
              <span className={styles.videoIndicator}>▶ VIDEO</span>
            </>
          ) : (
            <div className={styles.imageFallback}>📷</div>
          )}
        </div>

        <div className={styles.content}>
          {post.caption && (
            <p className={styles.caption}>{post.caption}</p>
          )}
          <div className={styles.meta}>
            <span className={styles.date}>
              {formatDate(post.date_taken)}
            </span>
            <span
              className={styles.albumBadge}
              style={{ backgroundColor: albumColor }}
            >
              {albumName}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
