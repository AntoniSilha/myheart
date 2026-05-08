import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PostCard from './components/PostCard';
import LoveCounter from './components/LoveCounter';
import { DEMO_POSTS } from '@/lib/demo-data';
import { isSupabaseConfigured } from '@/lib/utils';
import styles from './page.module.css';

async function getPosts() {
  if (isSupabaseConfigured()) {
    try {
      const { getSupabaseServer } = require('@/lib/supabase-server');
      const supabase = await getSupabaseServer();
      if (supabase) {
        const { data: featured, error: featuredErr } = await supabase
          .from('posts')
          .select('*, albums(*)')
          .eq('is_featured', true)
          .order('date_taken', { ascending: false })
          .limit(6);

        // If tables don't exist, fall back to demo
        if (featuredErr) {
          console.error('Supabase query error:', featuredErr.message);
          return {
            featured: DEMO_POSTS.filter((p) => p.is_featured),
            recent: DEMO_POSTS,
            isDemo: true,
          };
        }

        const { data: recent } = await supabase
          .from('posts')
          .select('*, albums(*)')
          .order('created_at', { ascending: false })
          .limit(8);

        return {
          featured: featured || [],
          recent: recent || [],
          isDemo: false,
        };
      }
    } catch (e) {
      console.error('Supabase error:', e);
    }
  }

  return {
    featured: DEMO_POSTS.filter((p) => p.is_featured),
    recent: DEMO_POSTS,
    isDemo: true,
  };
}

export default async function HomePage() {
  const { featured, recent, isDemo } = await getPosts();
  const name1 = process.env.NEXT_PUBLIC_COUPLE_NAME_1 || 'Romeo';
  const name2 = process.env.NEXT_PUBLIC_COUPLE_NAME_2 || 'Juliet';
  const anniversary = process.env.NEXT_PUBLIC_ANNIVERSARY_DATE || '2024-02-14';

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <span className={styles.decor + ' ' + styles.decor1}>💕</span>
          <span className={styles.decor + ' ' + styles.decor2}>✨</span>
          <span className={styles.decor + ' ' + styles.decor3}>🌸</span>
          <span className={styles.decor + ' ' + styles.decor4}>💫</span>
          <span className={styles.decor + ' ' + styles.decor5}>🦋</span>

          <div className={styles.heroContent}>
            <div className={styles.heroEmoji}>💕</div>
            <h1 className={styles.heroTitle}>
              {name1} <span className={styles.heroTitleHighlight}>&</span> {name2}
            </h1>
            <p className={styles.heroSubtitle}>
              Our little corner of the internet — where every moment together becomes a memory forever.
            </p>

            <LoveCounter anniversaryDate={anniversary} />

            <div className={styles.heroActions}>
              <Link href="/gallery" className="nb-btn nb-btn--pink nb-btn--lg">
                📸 View Gallery
              </Link>
              <Link href="/about" className="nb-btn nb-btn--outline nb-btn--lg">
                💌 Our Story
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Banner */}
        {isDemo && (
          <div className="container">
            <div className={styles.demoBanner}>
              <span className={styles.demoBannerIcon}>🎨</span>
              <span>
                Demo Mode — Connect Supabase to start uploading your own memories!{' '}
                <Link href="/admin/login" style={{ color: 'var(--color-pink)', textDecoration: 'underline' }}>
                  Setup Guide →
                </Link>
              </span>
            </div>
          </div>
        )}

        {/* Featured Memories */}
        {featured.length > 0 && (
          <section className="container section">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionEmoji}>⭐</span>
                Featured Memories
              </h2>
              <Link href="/gallery" className="nb-btn nb-btn--sm nb-btn--cyan">
                View All →
              </Link>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((post, i) => (
                <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <PostCard post={post} variant="featured" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Memories */}
        {recent.length > 0 && (
          <section className="container section">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionEmoji}>🕐</span>
                Recent Memories
              </h2>
            </div>
            <div className={styles.featuredGrid}>
              {recent.map((post, i) => (
                <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  <PostCard post={post} variant="regular" />
                </div>
              ))}
            </div>
          </section>
        )}

        {featured.length === 0 && recent.length === 0 && (
          <section className="container section">
            <div className={styles.emptyState}>
              <div className={styles.emptyStateEmoji}>📷</div>
              <h2 className={styles.emptyStateTitle}>No memories yet!</h2>
              <p className={styles.emptyStateText}>Start uploading your first photo or video from the admin panel.</p>
              <Link href="/admin/login" className="nb-btn nb-btn--pink">
                Go to Admin →
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
