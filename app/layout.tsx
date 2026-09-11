import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Dashboard | Octa Byte AI Full-Stack Assignment',
  description:
    'Production-quality Dynamic Portfolio Dashboard with live market data, sector grouping, 15-second auto-refresh, and comprehensive analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-gray-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
