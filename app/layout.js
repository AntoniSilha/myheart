import './globals.css';

export const metadata = {
  title: 'MyHeart 💕 — Our Love Story',
  description: 'A personal space to keep our beautiful memories together. Photos, videos, and love notes from our journey.',
  keywords: ['love', 'memories', 'photos', 'couple', 'gallery'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
