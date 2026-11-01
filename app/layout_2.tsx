export const metadata = { 
  title: 'Biz - Özel Mesajlaşma',
  description: 'Sadece ikimiz için özel mesajlaşma ❤️',
  manifest: '/manifest.json',
  themeColor: '#6C5CE7'
}
export const viewport = {
  themeColor: '#6C5CE7'
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><head><link rel="manifest" href="/manifest.json" /><meta name="theme-color" content="#6C5CE7" /></head><body>{children}</body></html>
}
