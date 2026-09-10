import "./globals.css"

export const metadata = {
  title: "AfroClip.ai",
  description: "Transforme tes vidéos YouTube en Shorts viraux",
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
