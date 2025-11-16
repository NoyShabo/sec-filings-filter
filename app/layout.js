import './globals.css'

export const metadata = {
  title: 'SEC Filings Filter',
  description: 'Search and filter SEC filings with advanced market cap controls',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

