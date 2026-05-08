'use client';

import { useState, useEffect } from 'react';
import styles from './LoveCounter.module.css';

export default function LoveCounter({ anniversaryDate }) {
  const [days, setDays] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculate = () => {
      const start = new Date(anniversaryDate || '2024-02-14');
      const now = new Date();
      const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      setDays(diff > 0 ? diff : 0);
    };
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  if (!mounted) return null;

  const digits = String(days).padStart(4, '0').split('');

  return (
    <div className={styles.counter}>
      <div className={styles.label}>Days of Love</div>
      <div className={styles.digits}>
        {digits.map((digit, i) => (
          <span key={i} className={styles.digit} style={{ animationDelay: `${i * 0.1}s` }}>
            {digit}
          </span>
        ))}
      </div>
      <div className={styles.heart}>❤️</div>
    </div>
  );
}
