import Header from '@/components/Header';
import ThemeProvider from '@/components/ThemeProvider';
import type { Metadata } from 'next';
import { Permanent_Marker, Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-permanent-marker',
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Moviemania',
    template: '%s | Moviemania',
  },
  description:
    'Browse and filter movies and TV shows by genre, year, rating and more. Powered by TMDB.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: next-themes sets data-theme on <html> before
    // hydration, so the server/client attribute mismatch here is expected.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${permanentMarker.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="pc:grid pc:min-h-screen pc:grid-cols-[minmax(256px,290px)_5fr]">
            <Header />
            {/* min-w-0: a grid item defaults to min-width:auto, which lets
                wide content (the home page's scrolling rails) push the column
                past its track instead of scrolling inside it. */}
            <section className="min-w-0 px-4 py-8">{children}</section>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
