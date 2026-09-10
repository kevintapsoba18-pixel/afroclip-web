 import "../../globals.css"

export const metadata = {
  title: 'AfroClip.ai',
  description: 'Ta description ici',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
