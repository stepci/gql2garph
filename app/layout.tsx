import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GraphQL ⇢ Garph',
  description: 'Easily migrate your GraphQL SDL to Garph',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='h-full'>
      <body className={inter.className + ' h-full'}>{children}</body>
    </html>
  )
}
