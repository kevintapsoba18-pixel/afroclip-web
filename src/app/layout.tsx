import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AfroClip.ai',
  description: 'Générez des clips courts à partir de vos vidéos YouTube',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
