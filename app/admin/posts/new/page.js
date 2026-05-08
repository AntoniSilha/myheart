'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import { DEMO_ALBUMS } from '@/lib/demo-data';
import { getMediaType } from '@/lib/utils';
import styles from '../posts.module.css';

export default function NewPostPage() {
  const [caption, setCaption] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [dateTaken, setDateTaken] = useState(new Date().toISOString().split('T')[0]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAlbums() {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        const { data } = await supabase
          .from('albums')
          .select('*')
          .order('sort_order');
        setAlbums(data || []);
      } else {
        setAlbums(DEMO_ALBUMS);
      }
    }
    fetchAlbums();
  }, []);

  function handleFileSelect(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMediaType(getMediaType(selectedFile.name));

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selectedFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);
    setMediaType(getMediaType(droppedFile.name));

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(droppedFile);
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const supabase = getSupabaseBrowser();

    if (!supabase) {
      // Demo mode
      setSuccess('✨ Post created! (Demo mode — connect Supabase to persist data)');
      setLoading(false);
      setTimeout(() => router.push('/admin/posts'), 2000);
      return;
    }

    try {
      let mediaUrl = '';

      // Upload file
      if (file) {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl.publicUrl;
      }

      // Insert post
      const { error: insertError } = await supabase.from('posts').insert({
        caption,
        album_id: albumId || null,
        date_taken: dateTaken,
        is_featured: isFeatured,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (insertError) throw insertError;

      setSuccess('✨ Memory saved successfully!');
      setTimeout(() => router.push('/admin/posts'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    }

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.postForm}>
        {success && <div className={styles.successMsg}>✅ {success}</div>}
        {error && <div className={styles.errorMsg}>❌ {error}</div>}

        {/* Upload */}
        <div className={styles.formGroup}>
          <label className="nb-label">📷 Photo / Video</label>
          {preview ? (
            <div className={styles.preview}>
              {mediaType === 'image' ? (
                <img src={preview} alt="Preview" />
              ) : (
                <video src={preview} controls style={{ width: '100%' }} />
              )}
              <button
                type="button"
                onClick={removeFile}
                className={`nb-btn nb-btn--red nb-btn--sm ${styles.previewRemove}`}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className={styles.uploadEmoji}>📁</div>
              <div className={styles.uploadText}>
                Click or drag & drop to upload
              </div>
              <div className={styles.uploadHint}>
                Supports: JPG, PNG, GIF, MP4, WEBM, MOV
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Caption */}
        <div className={styles.formGroup}>
          <label className="nb-label" htmlFor="caption">💬 Caption</label>
          <textarea
            id="caption"
            className="nb-textarea"
            placeholder="Write something sweet about this memory..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
        </div>

        {/* Album & Date */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className="nb-label" htmlFor="album">📁 Album</label>
            <select
              id="album"
              className="nb-select"
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
            >
              <option value="">No Album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className="nb-label" htmlFor="date">📅 Date Taken</label>
            <input
              id="date"
              type="date"
              className="nb-input"
              value={dateTaken}
              onChange={(e) => setDateTaken(e.target.value)}
            />
          </div>
        </div>

        {/* Featured */}
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          <label htmlFor="featured" className="nb-label" style={{ marginBottom: 0 }}>
            ⭐ Featured on Homepage
          </label>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className="nb-btn nb-btn--pink nb-btn--lg"
            disabled={loading}
          >
            {loading ? '⏳ Saving...' : '💾 Save Memory'}
          </button>
          <Link href="/admin/posts" className="nb-btn nb-btn--outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
