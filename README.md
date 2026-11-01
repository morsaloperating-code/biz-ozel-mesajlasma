# Biz - Özel Mesajlaşma 💜 - Ücretsiz Online (Supabase + Vercel + GitHub)

Sevgiline sürpriz için %100 ücretsiz online mesajlaşma uygulaması. Arkadaşın gibi hiç para ödemeden.

## 0 TL Maliyet - Hepsi Free Tier
- Supabase: Free 500MB DB, 1GB storage, sınırsız mesaj (2 kişi için fazlasıyla yeter)
- Vercel: Free hosting, sınırsız deploy
- GitHub: Free repo

---

## ADIM ADIM NE YAPMAN GEREKİYOR (10 dakika)

### ADIM 1 - GitHub Hesabı (1 dk)
1. https://github.com 'a git, ücretsiz hesap aç
2. Yeni repo oluştur: `biz-ozel-mesajlasma` isminde, Public seç

### ADIM 2 - Supabase Projesi (2 dk) - EN ÖNEMLİ
1. https://supabase.com 'a git, GitHub ile giriş yap (ücretsiz)
2. New Project -> İsim: `biz-app`, password oluştur (kaydet), region: EU West
3. Proje açılınca sol menüden SQL Editor -> New Query
4. Bu repodaki `supabase/schema.sql` dosyasının içindeki tüm kodu kopyala, yapıştır, RUN de
5. Sol menüden Storage -> New Bucket -> İsim: `media`, Public seç, Create
6. Sol menüden Project Settings -> API -> 
   - `Project URL` kopyala (örn: https://abc123.supabase.co)
   - `anon public` key kopyala

### ADIM 3 - Kodu GitHub'a Yükle (2 dk)
Bu klasördeki tüm dosyaları GitHub repo'na yükle:
- GitHub Desktop kullan veya web'den Upload files
- Veya terminal: 
  ```
  git init
  git add .
  git commit -m "ilk surum"
  git branch -M main
  git remote add origin https://github.com/KULLANICI_ADIN/biz-ozel-mesajlasma.git
  git push -u origin main
  ```

### ADIM 4 - Vercel'e Deploy (2 dk)
1. https://vercel.com 'a git, GitHub ile giriş yap (ücretsiz)
2. Add New -> Project -> GitHub repo'nu seç (`biz-ozel-mesajlasma`)
3. Environment Variables ekle:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase'den kopyaladığın URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase'den kopyaladığın anon key
4. Deploy de -> 1 dk sonra linkin hazır: `https://biz-ozel-mesajlasma.vercel.app`

### ADIM 5 - Kullan!
- Linki sevgiline at
- İkiniz de aynı linke girin
- Biri "Ben" rolünde, diğeri "Test" rolünde (rol değiştir butonu ile)
- Mesajlar anlık, resim/video/müzik/dosya gönderme çalışıyor, tepkiler, tema hepsi online!

---

## Özellikler (Tam WhatsApp gibi)
- ✅ Anlık mesajlaşma (Supabase Realtime)
- ✅ Resim, video, müzik, dosya paylaşımı (Supabase Storage)
- ✅ Tepki emojileri (❤️😂😡😢😮🙏👍) - ortaya ve mesaj hizasında
- ✅ Tek rozet (kalp yerine tepki)
- ✅ Tema renkleri gerçekten değişiyor (Mor/Pembe/Mavi/Koyu)
- ✅ Açık/Koyu mod
- ✅ Sil/düzenle, değiştirildi etiketi
- ✅ Yazma paneli sabit
- ✅ Son mesaja odaklanma
- ✅ Ücretsiz, limitsiz (2 kişi için)

---

## Sürpriz için İpucu
1. Vercel linkini bit.ly ile kısalt: bit.ly/bizim-ozel-yerimiz gibi
2. Sevgiline "Sana bir sürprizim var, bu linke tıkla" de
3. İlk mesajı sen at: "Sadece ikimiz için bir yer yaptım ❤️"

---

## Sorun Olursa
- Supabase'de tablo oluşmadıysa schema.sql'i tekrar çalıştır
- Storage bucket `media` public olmalı
- Vercel'de env variables doğru olmalı
- Bana sor!

İyi eğlenceler dostum! Sevgiline selam! 💜
