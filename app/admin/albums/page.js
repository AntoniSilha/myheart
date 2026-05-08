'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { DEMO_ALBUMS } from '@/lib/demo-data';
import { slugify } from '@/lib/utils';
import styles from '../posts/posts.module.css';

const COLORS = ['#ff6b9d','#ffd93d','#6bcbff','#95e77e','#c084fc','#ff9f43','#ff6b6b'];

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      const { data } = await supabase.from('albums').select('*').order('sort_order');
      setAlbums(data || []);
    } else {
      setAlbums(DEMO_ALBUMS);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(''); setSuccess('');
    const supabase = getSupabaseBrowser();
    const albumData = {
      name: name.trim(),
      slug: slugify(name.trim()),
      description,
      color,
      sort_order: albums.length + 1,
    };

    if (!supabase) {
      if (editId) {
        setAlbums(albums.map(a => a.id === editId ? { ...a, ...albumData } : a));
        setSuccess('Album updated! (Demo)');
      } else {
        setAlbums([...albums, { ...albumData, id: `album-${Date.now()}`, created_at: new Date().toISOString() }]);
        setSuccess('Album created! (Demo)');
      }
      resetForm(); setLoading(false); return;
    }

    try {
      if (editId) {
        const { error: err } = await supabase.from('albums').update(albumData).eq('id', editId);
        if (err) throw err;
        setSuccess('Album updated!');
      } else {
        const { error: err } = await supabase.from('albums').insert(albumData);
        if (err) throw err;
        setSuccess('Album created!');
      }
      await fetchAlbums();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function startEdit(album) {
    setEditId(album.id);
    setName(album.name);
    setDescription(album.description || '');
    setColor(album.color || COLORS[0]);
  }

  function resetForm() {
    setEditId(null); setName(''); setDescription(''); setColor(COLORS[0]);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this album? Posts in this album will become uncategorized.')) return;
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.from('posts').update({ album_id: null }).eq('album_id', id);
      await supabase.from('albums').delete().eq('id', id);
      await fetchAlbums();
    } else {
      setAlbums(albums.filter(a => a.id !== id));
    }
  }

  return (
    <div className={styles.postsPage}>
      {/* Album Form */}
      <div style={{ maxWidth: '500px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '16px' }}>
          {editId ? '✏️ Edit Album' : '➕ New Album'}
        </h2>
        <form onSubmit={handleSubmit} className={styles.postForm}>
          {success && <div className={styles.successMsg}>✅ {success}</div>}
          {error && <div className={styles.errorMsg}>❌ {error}</div>}

          <div className={styles.formGroup}>
            <label className="nb-label">Album Name</label>
            <input className="nb-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anniversary" required />
          </div>

          <div className={styles.formGroup}>
            <label className="nb-label">Description</label>
            <input className="nb-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <div className={styles.formGroup}>
            <label className="nb-label">Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  style={{
                    width: '40px', height: '40px', background: c,
                    border: color === c ? '4px solid #1a1a1a' : '2px solid #1a1a1a',
                    boxShadow: color === c ? '3px 3px 0 #1a1a1a' : 'none',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="nb-btn nb-btn--pink" disabled={loading}>
              {loading ? '⏳' : editId ? '💾 Update' : '➕ Create'}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="nb-btn nb-btn--outline">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Albums List */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '16px' }}>
          📁 All Albums ({albums.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {albums.map((album) => (
            <div key={album.id} className="nb-card" style={{ backgroundColor: album.color + '33', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '16px', height: '16px', background: album.color, border: '2px solid #1a1a1a' }} />
                <strong style={{ fontFamily: 'var(--font-display)' }}>{album.name}</strong>
              </div>
              {album.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{album.description}</p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(album)} className="nb-btn nb-btn--sm nb-btn--cyan">✏️</button>
                <button onClick={() => handleDelete(album.id)} className="nb-btn nb-btn--sm nb-btn--red">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
