import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { DEMO_POSTS } from '@/lib/demo-data';
import { isSupabaseConfigured, formatDate } from '@/lib/utils';
import styles from './page.module.css';

async function getPost(id) {
  if (isSupabaseConfigured()) {
    try {
      const { getSupabaseServer } = require('@/lib/supabase-server');
      const supabase = await getSupabaseServer();
      if (supabase) {
        const { data: post, error: postErr } = await supabase
          .from('posts')
          .select('*, albums(*)')
          .eq('id', id)
          .single();

        if (postErr) {
          // Table doesn't exist or other error — fall back to demo
          const demoIdx = DEMO_POSTS.findIndex((p) => p.id === id);
          return {
            post: DEMO_POSTS[demoIdx] || DEMO_POSTS[0],
            prevPost: demoIdx > 0 ? DEMO_POSTS[demoIdx - 1] : null,
            nextPost: demoIdx < DEMO_POSTS.length - 1 ? DEMO_POSTS[demoIdx + 1] : null,
          };
        }

        if (post) {
          // Get prev/next
          const { data: allPosts } = await supabase
            .from('posts')
            .select('id, caption, date_taken')
            .order('date_taken', { ascending: false });

          const idx = allPosts?.findIndex((p) => p.id === id) ?? -1;
          return {
            post,
            prevPost: idx > 0 ? allPosts[idx - 1] : null,
            nextPost: idx < (allPosts?.length || 0) - 1 ? allPosts[idx + 1] : null,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Demo fallback
  const idx = DEMO_POSTS.findIndex((p) => p.id === id);
  return {
    post: DEMO_POSTS[idx] || DEMO_POSTS[0],
    prevPost: idx > 0 ? DEMO_POSTS[idx - 1] : null,
    nextPost: idx < DEMO_POSTS.length - 1 ? DEMO_POSTS[idx + 1] : null,
  };
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const { post, prevPost, nextPost } = await getPost(id);

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="container section" style={{ textAlign: 'center', minHeight: '60vh' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😢</div>
          <h1>Memory not found</h1>
          <p style={{ marginBottom: '24px', color: 'var(--color-text-muted)' }}>
            This memory might have been moved or deleted.
          </p>
          <Link href="/gallery" className="nb-btn nb-btn--pink">
            Back to Gallery
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const albumColor = post.albums?.color || '#ff6b9d';

  return (
    <>
      <Navbar />
      <main className={styles.postPage}>
        {/* Media */}
        <div className={styles.postMedia}>
          {post.media_url && post.media_type === 'image' ? (
            <img src={post.media_url} alt={post.caption || 'Memory'} />
          ) : post.media_url && post.media_type === 'video' ? (
            <video
              src={post.media_url}
              controls
              autoPlay={false}
              style={{ width: '100%' }}
            />
          ) : (
            <div className={styles.mediaFallback}>📷</div>
          )}
        </div>

        {/* Content */}
        <div className={styles.postContent}>
          <Link href="/gallery" className={styles.backLink}>
            ← Back to Gallery
          </Link>

          <div className={styles.postMeta}>
            <span className={styles.postDate}>
              📅 {formatDate(post.date_taken)}
            </span>
            {post.albums && (
              <Link
                href={`/gallery?album=${post.albums.slug}`}
                className={styles.postAlbum}
                style={{ backgroundColor: albumColor }}
              >
                {post.albums.name}
              </Link>
            )}
          </div>

          {post.caption && (
            <p className={styles.postCaption}>{post.caption}</p>
          )}

          {/* Navigation */}
          <div className={styles.postNav}>
            <div className={styles.postNavLink}>
              {prevPost && (
                <Link href={`/post/${prevPost.id}`} className="nb-btn nb-btn--outline nb-btn--sm" style={{ width: '100%' }}>
                  ← Previous
                </Link>
              )}
            </div>
            <div className={styles.postNavLink}>
              {nextPost && (
                <Link href={`/post/${nextPost.id}`} className="nb-btn nb-btn--outline nb-btn--sm" style={{ width: '100%' }}>
                  Next →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
