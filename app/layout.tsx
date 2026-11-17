import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AETHERIA — Floating Thoughts & Emotions',
  description:
    'Share fleeting thoughts and emotions inside iridescent floating soap bubbles — up to five reflections a day.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'AETHERIA — Floating Thoughts & Emotions',
    description:
      'Share fleeting thoughts and emotions inside iridescent floating soap bubbles — up to five reflections a day.',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'AETHERIA Icon' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AETHERIA — Floating Thoughts & Emotions',
    description:
      'Share fleeting thoughts and emotions inside iridescent floating soap bubbles — up to five reflections a day.',
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`}>
      <body
        className="font-sans antialiased text-slate-800 selection:bg-violet-200/60 selection:text-slate-900 overflow-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
