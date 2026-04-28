import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boîte à outils Lit uP',
  description: 'Des outils pédagogiques qui donnent le pouvoir d\'agir — aux jeunes comme aux équipes.',
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
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#F6F6F8] text-anthracite antialiased">
        {children}
      </body>
    </html>
  );
}
