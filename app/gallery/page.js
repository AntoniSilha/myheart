'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import PostCard from '@/app/components/PostCard';
import { DEMO_POSTS, DEMO_ALBUMS } from '@/lib/demo-data';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import styles from './page.module.css';

export default function GalleryPage() {
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowser();

      if (supabase) {
        try {
          const { data: albumsData, error: albumsErr } = await supabase
            .from('albums')
            .select('*')
            .order('sort_order');

          const { data: postsData, error: postsErr } = await supabase
            .from('posts')
            .select('*, albums(*)')
            .order('date_taken', { ascending: false });

          if (albumsErr || postsErr) {
            console.error('Supabase query error:', albumsErr?.message || postsErr?.message);
            setAlbums(DEMO_ALBUMS);
            setPosts(DEMO_POSTS);
          } else {
            setAlbums(albumsData || []);
            setPosts(postsData || []);
          }
        } catch (e) {
          console.error(e);
          setAlbums(DEMO_ALBUMS);
          setPosts(DEMO_POSTS);
        }
      } else {
        setAlbums(DEMO_ALBUMS);
        setPosts(DEMO_POSTS);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredPosts =
    activeAlbum === 'all'
      ? posts
      : posts.filter((p) => p.album_id === activeAlbum);

  const variants = ['regular', 'tall', 'regular', 'featured', 'regular', 'tall'];

  return (
    <>
      <Navbar />
      <main className="container">
        <div className={styles.galleryHeader}>
          <h1 className={styles.galleryTitle}>📸 Our Gallery</h1>
          <p className={styles.gallerySubtitle}>
            Every photo tells a story, every video captures a feeling.
          </p>
        </div>

        {/* Album Filters */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterChip} ${activeAlbum === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setActiveAlbum('all')}
            style={activeAlbum === 'all' ? { background: 'var(--color-pink)' } : {}}
          >
            ✨ All
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              className={`${styles.filterChip} ${activeAlbum === album.id ? styles.filterChipActive : ''}`}
              onClick={() => setActiveAlbum(album.id)}
              style={activeAlbum === album.id ? { background: album.color } : {}}
            >
              {album.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className={styles.emptyGallery}>
            <div className={styles.emptyEmoji}>⏳</div>
            <h2 className={styles.emptyTitle}>Loading memories...</h2>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className={styles.masonry}>
            {filteredPosts.map((post, i) => (
              <div
                key={post.id}
                className={`${styles.masonryItem} animate-slide-up`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <PostCard post={post} variant={variants[i % variants.length]} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyGallery}>
            <div className={styles.emptyEmoji}>🔍</div>
            <h2 className={styles.emptyTitle}>No memories in this album yet</h2>
            <p className={styles.emptyText}>Try selecting a different album or add new memories!</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
