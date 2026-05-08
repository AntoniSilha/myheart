'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { DEMO_POSTS, DEMO_ALBUMS } from '@/lib/demo-data';
import { getMediaType } from '@/lib/utils';
import styles from '../posts.module.css';

export default function EditPostPage({ params }) {
  const { id } = use(params);
  const [caption, setCaption] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [dateTaken, setDateTaken] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        const { data: a } = await supabase.from('albums').select('*').order('sort_order');
        setAlbums(a || []);
        const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
        if (post) {
          setCaption(post.caption || '');
          setAlbumId(post.album_id || '');
          setDateTaken(post.date_taken || '');
          setIsFeatured(post.is_featured || false);
          setMediaUrl(post.media_url || '');
          setMediaType(post.media_type || 'image');
          setPreview(post.media_url || null);
        }
      } else {
        setAlbums(DEMO_ALBUMS);
        const d = DEMO_POSTS.find(p => p.id === id) || DEMO_POSTS[0];
        setCaption(d.caption || ''); setAlbumId(d.album_id || '');
        setDateTaken(d.date_taken || ''); setIsFeatured(d.is_featured || false);
        setMediaUrl(d.media_url || ''); setMediaType(d.media_type || 'image');
        setPreview(d.media_url || null);
      }
      setFetching(false);
    }
    fetchData();
  }, [id]);

  function handleFileSelect(e) {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setMediaType(getMediaType(f.name));
    const r = new FileReader();
    r.onload = (ev) => setPreview(ev.target.result);
    r.readAsDataURL(f);
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('');
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setSuccess('Updated! (Demo mode)'); setLoading(false);
      setTimeout(() => router.push('/admin/posts'), 2000); return;
    }
    try {
      let url = mediaUrl;
      if (file) {
        const ext = file.name.split('.').pop();
        const fn = `${Date.now()}.${ext}`;
        const { error: ue } = await supabase.storage.from('media').upload(fn, file);
        if (ue) throw ue;
        const { data: pu } = supabase.storage.from('media').getPublicUrl(fn);
        url = pu.publicUrl;
      }
      const { error: err2 } = await supabase.from('posts').update({
        caption, album_id: albumId || null, date_taken: dateTaken,
        is_featured: isFeatured, media_url: url, media_type: mediaType,
      }).eq('id', id);
      if (err2) throw err2;
      setSuccess('Updated!'); setTimeout(() => router.push('/admin/posts'), 1500);
    } catch (err) { setError(err.message || 'Failed'); }
    setLoading(false);
  }

  if (fetching) return <div style={{textAlign:'center',padding:'64px',fontSize:'1.5rem'}}>⏳ Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.postForm}>
      {success && <div className={styles.successMsg}>✅ {success}</div>}
      {error && <div className={styles.errorMsg}>❌ {error}</div>}
      <div className={styles.formGroup}>
        <label className="nb-label">📷 Media</label>
        {preview ? (
          <div className={styles.preview}>
            {mediaType === 'image' ? <img src={preview} alt="Preview" /> : <video src={preview} controls style={{width:'100%'}} />}
            <button type="button" onClick={() => {setPreview(null);setFile(null);setMediaUrl('');}} className={`nb-btn nb-btn--red nb-btn--sm ${styles.previewRemove}`}>✕</button>
          </div>
        ) : (
          <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            <div className={styles.uploadEmoji}>📁</div>
            <div className={styles.uploadText}>Click to upload</div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{display:'none'}} />
      </div>
      <div className={styles.formGroup}>
        <label className="nb-label">💬 Caption</label>
        <textarea className="nb-textarea" value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} />
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className="nb-label">📁 Album</label>
          <select className="nb-select" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
            <option value="">No Album</option>
            {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className="nb-label">📅 Date</label>
          <input type="date" className="nb-input" value={dateTaken} onChange={(e) => setDateTaken(e.target.value)} />
        </div>
      </div>
      <div className={styles.checkboxGroup}>
        <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        <label htmlFor="featured" className="nb-label" style={{marginBottom:0}}>⭐ Featured</label>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="nb-btn nb-btn--pink nb-btn--lg" disabled={loading}>
          {loading ? '⏳ Saving...' : '💾 Update'}
        </button>
        <Link href="/admin/posts" className="nb-btn nb-btn--outline">Cancel</Link>
      </div>
    </form>
  );
}
