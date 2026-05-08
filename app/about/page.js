import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import LoveCounter from '@/app/components/LoveCounter';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us — MyHeart 💕',
  description: 'Our love story and the journey that brought us together.',
};

export default function AboutPage() {
  const name1 = process.env.NEXT_PUBLIC_COUPLE_NAME_1 || 'Romeo';
  const name2 = process.env.NEXT_PUBLIC_COUPLE_NAME_2 || 'Juliet';
  const anniversary = process.env.NEXT_PUBLIC_ANNIVERSARY_DATE || '2024-02-14';

  return (
    <>
      <Navbar />
      <main className={`container ${styles.aboutPage}`}>
        <div className={styles.aboutHero}>
          <div className={styles.aboutEmoji}>💕</div>
          <h1 className={styles.aboutTitle}>Our Love Story</h1>
          <p className={styles.aboutSubtitle}>
            The story of {name1} & {name2} — and all the beautiful moments in between.
          </p>
        </div>

        {/* Love Counter */}
        <div style={{ marginBottom: 'var(--space-3xl)' }}>
          <LoveCounter anniversaryDate={anniversary} />
        </div>

        {/* Story */}
        <div className={`${styles.storyCard} animate-slide-up`} style={{ opacity: 0, animationDelay: '0.1s' }}>
          <h2 className={styles.storyCardTitle}>
            <span>🌟</span> How It All Began
          </h2>
          <div className={styles.storyCardText}>
            <p>
              Some stories start with a grand gesture. Ours started with a simple smile.
              From that very first moment, we knew something special was about to unfold.
            </p>
            <p>
              This website is our digital scrapbook — a place where we collect every precious
              moment, every laugh, every adventure. Because every second with you is worth
              remembering forever.
            </p>
          </div>
        </div>

        <div className={`${styles.storyCard} animate-slide-up`} style={{ opacity: 0, animationDelay: '0.2s' }}>
          <h2 className={styles.storyCardTitle}>
            <span>💝</span> What We Love About Us
          </h2>
          <div className={styles.storyCardText}>
            <p>
              We love the little things — morning coffee together, spontaneous road trips,
              late-night conversations about everything and nothing. Every day is a new
              adventure when we&apos;re together.
            </p>
            <p>
              This gallery is a reminder that the best things in life aren&apos;t things at all —
              they&apos;re the moments we share with the people we love.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className={styles.highlightsGrid}>
          <div className={`${styles.highlightCard} animate-pop-in`} style={{ backgroundColor: 'var(--color-pink-light)', opacity: 0, animationDelay: '0.3s' }}>
            <div className={styles.highlightEmoji}>📸</div>
            <div className={styles.highlightLabel}>Memories</div>
            <div className={styles.highlightValue}>∞</div>
          </div>
          <div className={`${styles.highlightCard} animate-pop-in`} style={{ backgroundColor: 'var(--color-yellow-light)', opacity: 0, animationDelay: '0.4s' }}>
            <div className={styles.highlightEmoji}>🎉</div>
            <div className={styles.highlightLabel}>Adventures</div>
            <div className={styles.highlightValue}>Countless</div>
          </div>
          <div className={`${styles.highlightCard} animate-pop-in`} style={{ backgroundColor: 'var(--color-cyan-light)', opacity: 0, animationDelay: '0.5s' }}>
            <div className={styles.highlightEmoji}>❤️</div>
            <div className={styles.highlightLabel}>Love</div>
            <div className={styles.highlightValue}>Forever</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
