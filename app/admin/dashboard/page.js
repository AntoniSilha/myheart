'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { DEMO_POSTS, DEMO_ALBUMS, getDemoStats } from '@/lib/demo-data';
import { formatDate } from '@/lib/utils';
import styles from './page.module.css';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPosts: 0, totalAlbums: 0, totalFeatured: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowser();

      if (supabase) {
        try {
          const { count: postCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

          const { count: albumCount } = await supabase
            .from('albums')
            .select('*', { count: 'exact', head: true });

          const { count: featuredCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('is_featured', true);

          const { data: recent } = await supabase
            .from('posts')
            .select('*, albums(*)')
            .order('created_at', { ascending: false })
            .limit(5);

          setStats({
            totalPosts: postCount || 0,
            totalAlbums: albumCount || 0,
            totalFeatured: featuredCount || 0,
          });
          setRecentPosts(recent || []);
          setIsDemo(false);
          return;
        } catch (e) {
          console.error(e);
        }
      }

      // Demo fallback
      setStats(getDemoStats());
      setRecentPosts(DEMO_POSTS.slice(0, 5));
      setIsDemo(true);
    }

    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ backgroundColor: 'var(--color-pink-light)' }}>
          <div className={styles.statEmoji}>📸</div>
          <div className={styles.statValue}>{stats.totalPosts}</div>
          <div className={styles.statLabel}>Total Posts</div>
        </div>
        <div className={styles.statCard} style={{ backgroundColor: 'var(--color-cyan-light)' }}>
          <div className={styles.statEmoji}>📁</div>
          <div className={styles.statValue}>{stats.totalAlbums}</div>
          <div className={styles.statLabel}>Albums</div>
        </div>
        <div className={styles.statCard} style={{ backgroundColor: 'var(--color-yellow-light)' }}>
          <div className={styles.statEmoji}>⭐</div>
          <div className={styles.statValue}>{stats.totalFeatured}</div>
          <div className={styles.statLabel}>Featured</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
        <div className={styles.quickActions}>
          <Link href="/admin/posts/new" className="nb-btn nb-btn--pink">
            ➕ New Post
          </Link>
          <Link href="/admin/albums" className="nb-btn nb-btn--cyan">
            📁 Manage Albums
          </Link>
          <Link href="/" className="nb-btn nb-btn--outline" target="_blank">
            🌐 View Site
          </Link>
        </div>
      </div>

      {/* Setup Guide (demo only) */}
      {isDemo && (
        <div className={styles.setupGuide}>
          <h3>🚀 Setup Guide — Connect Supabase</h3>
          <ol>
            <li>Create a free project at <strong>supabase.com</strong></li>
            <li>Create tables: <code>albums</code> and <code>posts</code> (see SQL below)</li>
            <li>Create a Storage bucket named <code>media</code> (public)</li>
            <li>Copy your project URL and anon key to <code>.env.local</code></li>
            <li>Register your admin email in Supabase Auth → Users</li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      )}

      {/* Recent Posts */}
      <div>
        <h2 className={styles.sectionTitle}>🕐 Recent Posts</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.recentTable}>
            <thead>
              <tr>
                <th>Media</th>
                <th>Caption</th>
                <th>Album</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    {post.media_url && post.media_type === 'image' ? (
                      <img src={post.media_url} alt="" className={styles.tableThumb} />
                    ) : (
                      <div className={styles.tableThumbFallback}>
                        {post.media_type === 'video' ? '🎬' : '📷'}
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: '250px' }}>
                    {post.caption?.substring(0, 50)}{post.caption?.length > 50 ? '...' : ''}
                  </td>
                  <td>
                    <span
                      className="nb-badge"
                      style={{ backgroundColor: post.albums?.color || '#eee' }}
                    >
                      {post.albums?.name || '-'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {formatDate(post.date_taken)}
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <Link
                        href={`/post/${post.id}`}
                        className="nb-btn nb-btn--sm nb-btn--outline"
                        target="_blank"
                      >
                        👁️
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="nb-btn nb-btn--sm nb-btn--cyan"
                      >
                        ✏️
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    No posts yet. Create your first memory! 📸
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
