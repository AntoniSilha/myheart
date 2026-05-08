'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-client';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Skip auth check on login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    async function checkAuth() {
      const supabase = getSupabaseBrowser();

      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/admin/login');
          return;
        }
        setAuthenticated(true);
      } else {
        // Demo mode
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('myheart_demo_admin');
        if (!isDemo) {
          router.push('/admin/login');
          return;
        }
        setAuthenticated(true);
      }
      setChecking(false);
    }

    checkAuth();
  }, [isLoginPage, router]);

  async function handleLogout() {
    const supabase = getSupabaseBrowser();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('myheart_demo_admin');
    router.push('/admin/login');
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '2rem',
        fontFamily: 'var(--font-display)',
        background: 'var(--color-bg)',
      }}>
        ⏳ Checking authentication...
      </div>
    );
  }

  if (!authenticated) return null;

  const navLinks = [
    { href: '/admin/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/posts', label: '📝 Posts', icon: '📝' },
    { href: '/admin/posts/new', label: '➕ New Post', icon: '➕' },
    { href: '/admin/albums', label: '📁 Albums', icon: '📁' },
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            <span className={styles.sidebarLogoHeart}>💕</span>
            <span>MyHeart</span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.sidebarLink} ${pathname === link.href ? styles.sidebarLinkActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarLink}>
            🌐 View Site
          </Link>
          <button
            onClick={handleLogout}
            className={styles.sidebarLink}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className={styles.topBarTitle}>
            {navLinks.find(l => pathname.startsWith(l.href))?.label || '📊 Admin'}
          </h1>
          <div></div>
        </div>
        {children}
      </div>
    </div>
  );
}
