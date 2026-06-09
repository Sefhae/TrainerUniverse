import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Providers from '@/components/Providers';
import SiteShell from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'TrainerUniverse — Find Your Perfect Trainer',
  description:
    'The marketplace for elite personal training. Find a coach who matches your goals, your schedule, and your ambition.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme: set the class synchronously before first paint so the
            page never flickers from dark→light (or vice-versa) on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('traineruniverse-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.classList.add('theme-'+t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('theme-dark');}",
          }}
        />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
