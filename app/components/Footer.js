import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerHeart}>💕</div>
        <p className={styles.footerText}>
          Made with love, for us.
        </p>
        <p className={styles.footerQuote}>
          &ldquo;Every love story is beautiful, but ours is my favorite.&rdquo;
        </p>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} MyHeart</span>
          <Link href="/admin/login" className={styles.footerLink}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
