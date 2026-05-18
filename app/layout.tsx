import type { Metadata } from 'next';
import './globals.css';
import Providers from '../src/components/Providers';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

export const metadata: Metadata = {
  title: 'FitConnect — Find Your Perfect Trainer',
  description:
    'The marketplace for elite personal training. Find a coach who matches your goals, your schedule, and your ambition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
