'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = getSupabaseBrowser();
  const isConfigured = !!supabase;

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isConfigured) {
      // Demo mode — allow any login
      if (email && password) {
        localStorage.setItem('myheart_demo_admin', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Please fill in both fields');
      }
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginEmoji}>🔐</div>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>Access your memories dashboard</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          {error && <div className={styles.loginError}>⚠️ {error}</div>}

          <div className={styles.formGroup}>
            <label className="nb-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="nb-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className="nb-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="nb-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="nb-btn nb-btn--pink"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <Link href="/" className={styles.loginFooterLink}>
            ← Back to Home
          </Link>
        </div>

        {!isConfigured && (
          <div className={styles.demoNote}>
            🎨 <strong>Demo Mode:</strong> Enter any email & password to access the admin panel.
            Connect Supabase for real authentication.
          </div>
        )}
      </div>
    </div>
  );
}
