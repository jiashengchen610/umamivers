import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'

const notoSans = Noto_Sans({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Umami Builder - Search ingredients by Umami & TCM',
  description: 'Discover ingredients based on umami compounds and Traditional Chinese Medicine properties. Build perfect flavor combinations with scientific precision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={notoSans.className}>{children}</body>
    </html>
  )
}// Build: 1762107539
