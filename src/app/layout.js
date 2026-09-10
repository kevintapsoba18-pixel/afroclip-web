import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
