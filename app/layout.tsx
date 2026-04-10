import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RIBIT Boats — Build Your Boat',
  description: 'Configure your custom RIBIT aluminum RIB. Choose your model, colors, console, engine, and accessories.',
  openGraph: {
    title: 'RIBIT Boats — Build Your Boat',
    description: 'Customize your RIBIT H390 or H420 hybrid RIB.',
    siteName: 'RIBIT Boats',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0F1C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
