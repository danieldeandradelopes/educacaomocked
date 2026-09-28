import type { Metadata } from 'next';
import { Literata, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const display = Literata({
  subsets: ['latin'],
  variable: '--font-edu-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-edu-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Secretaria Municipal de Educação | Dashboard',
  description:
    'Protótipo mockado do dashboard executivo da educação municipal para validação com a Dirigente.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
