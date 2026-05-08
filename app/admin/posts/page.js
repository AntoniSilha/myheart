'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { DEMO_POSTS } from '@/lib/demo-data';
import { formatDate } from '@/lib/utils';
import styles from './posts.module.css';

export default function PostsListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        try {
          const { data } = await supabase
            .from('posts')
            .select('*, albums(*)')
            .order('created_at', { ascending: false });
          setPosts(data || []);
        } catch {
          setPosts(DEMO_POSTS);
        }
      } else {
        setPosts(DEMO_POSTS);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    const supabase = getSupabaseBrowser();
    if (supabase) {
      const post = posts.find(p => p.id === id);
      if (post?.media_url) {
        // Extract path from URL for storage deletion
        const path = post.media_url.split('/storage/v1/object/public/media/')[1];
        if (path) {
          await supabase.storage.from('media').remove([path]);
        }
      }
      await supabase.from('posts').delete().eq('id', id);
    }
    setPosts(posts.filter(p => p.id !== id));
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '64px', fontSize: '1.5rem' }}>⏳ Loading...</div>;
  }

  return (
    <div className={styles.postsPage}>
      <div className={styles.postsHeader}>
        <h2 className={styles.postsTitle}>All Posts ({posts.length})</h2>
        <Link href="/admin/posts/new" className="nb-btn nb-btn--pink">
          ➕ New Post
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className={styles.postsGrid}>
          {posts.map((post) => (
            <div key={post.id} className={styles.postItem}>
              {post.media_url && post.media_type === 'image' ? (
                <img src={post.media_url} alt="" className={styles.postItemImage} />
              ) : (
                <div className={styles.postItemFallback}>
                  {post.media_type === 'video' ? '🎬' : '📷'}
                </div>
              )}
              <div className={styles.postItemContent}>
                <p className={styles.postItemCaption}>
                  {post.caption || 'No caption'}
                </p>
                <div className={styles.postItemMeta}>
                  <span>{formatDate(post.date_taken)}</span>
                  {post.is_featured && <span>⭐</span>}
                </div>
                <div className={styles.postItemActions}>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="nb-btn nb-btn--sm nb-btn--cyan"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="nb-btn nb-btn--sm nb-btn--red"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📷</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No posts yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Create your first memory!</p>
          <Link href="/admin/posts/new" className="nb-btn nb-btn--pink">
            ➕ Create First Post
          </Link>
        </div>
      )}
    </div>
  );
}
