import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dorixona Skaner — Dori Kod Skaneri',
  description: "O'zbekiston dorixonalar uchun EAN-13 va DataMatrix skaner ilovasi. Dori ma'lumotlarini tez toping.",
  keywords: ['dorixana', 'skaner', 'barcode', 'dori', "o'zbekiston", 'pharmacy', 'scanner'],
  authors: [{ name: 'Dorixona Skaner' }],
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://dorixona-scaner.uz',
    title: 'Dorixona Skaner',
    description: "Dori kodlarini skaner qiling — ma'lumotlarni tez oling",
    siteName: 'Dorixona Skaner',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Temani avtomatik yuklash — FOUC oldini olish */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = JSON.parse(localStorage.getItem('dorixona-settings') || '{}');
                  var theme = (stored.state && stored.state.theme) || 'dark';
                  var root = document.documentElement;
                  if (theme === 'auto') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  root.classList.add(theme);
                  root.classList.remove(theme === 'dark' ? 'light' : 'dark');
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
