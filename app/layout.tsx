export const metadata = { title: 'Biz - Özel Mesajlaşma', description: 'Sadece ikimiz için' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body>{children}</body></html>
}
