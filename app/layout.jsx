import './globals.css';
import Header from '@/components/Header';

export const metadata = { title: 'VibeNest — find a home by feel', description: 'Real estate search with structured filters and vibe-based semantic search' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
