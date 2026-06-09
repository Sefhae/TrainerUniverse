# Supabase Kurulumu — Adım Adım (Yeni Başlayanlar İçin)

Uygulama artık **tamamen Supabase** kullanıyor:

- **Giriş/Kayıt/Çıkış** → Supabase Auth (parolaları Supabase yönetiyor)
- **Tüm veritabanı işlemleri** → Supabase JS client (`@/utils/supabase`) + RLS

Aşağıdaki adımları **sırayla** uygula. Hepsi tek seferlik; bir kez yaptıktan sonra uygulama çalışır.

---

## 1. Supabase anahtarlarını al

1. https://supabase.com → projene gir.
2. Sol menü: **Project Settings** (dişli) → **API**.
3. Şu 3 değeri kopyala:
   - **Project URL** (örn. `https://xxxx.supabase.co`)
   - **anon / publishable key** (`anon` `public`)
   - **service_role key** (👁 ile göster — **gizli**, kimseyle paylaşma)

## 2. `.env.local` dosyasını doldur

Proje kök klasöründeki `.env.local` dosyası şöyle olmalı (kendi değerlerinle):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...        # anon/publishable key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                   # service_role key (gizli!)
```

> `SUPABASE_SERVICE_ROLE_KEY` yalnızca admin işlemleri (başka kullanıcıyı yönetme) için
> gerekir ve **sadece sunucuda** kullanılır, tarayıcıya asla gitmez.

Değişiklikten sonra `npm run dev`'i durdurup yeniden başlat (env dosyaları başlangıçta okunur).

## 3. Veritabanı tablolarını oluştur

1. Supabase panelinde sol menü: **SQL Editor** → **New query**.
2. Bu projedeki **`supabase/schema.sql`** dosyasının **tamamını** kopyala, editöre yapıştır.
3. **Run** (▶) bas. "Success" görmelisin.

Bu; tüm tabloları, güvenlik politikalarını (RLS) ve uzmanlık listesini oluşturur.
İstersen tekrar çalıştırabilirsin, zarar vermez (idempotent).

## 4. E-posta onayını kapat (kayıt sonrası anında giriş için)

Varsayılan olarak Supabase, kayıt olan kullanıcıya doğrulama e-postası gönderir ve
onaylanana kadar oturum açılmaz. Uygulamamız kayıttan hemen sonra giriş yaptığı için
bunu kapatıyoruz:

1. Sol menü: **Authentication** → **Sign In / Providers** (veya **Providers → Email**).
2. **Confirm email** seçeneğini **kapat** (Off) ve kaydet.

> Geliştirme için bu yeterli. Üretimde e-posta onayı istersen açabilirsin; o zaman
> kayıt akışı "E-postanı onayla, sonra giriş yap" mesajı döndürür.

## 5. Çalıştır ve dene

```
npm run dev
```

- `/login` sayfasından **kayıt ol** → yeni bir trainer/öğrenci hesabı oluştur.
- Çıkış yap, tekrar **giriş** yap. Çalışıyorsa Auth tamamdır. 🎉

> Not: Eski (bcrypt'li) kullanıcılar Supabase Auth'a **otomatik taşınmaz**. Herkes
> yeniden kayıt olmalı (veya panelden **Authentication → Users → Add user** ile eklenmeli).

## 6. (İsteğe bağlı) Admin hesabı oluştur

Admin paneli `role = 'admin'` olan bir Supabase kullanıcısıyla çalışır:

1. **Authentication → Users → Add user** → e-posta + parola gir, **Auto confirm** açık olsun.
2. Oluşan kullanıcının **User UID**'sini kopyala.
3. **SQL Editor**'de şunu çalıştır (UID ve e-postayı kendininkiyle değiştir):

```sql
insert into public.users (auth_id, email, role)
values ('BURAYA-USER-UID', 'admin@ornek.com', 'admin')
on conflict (auth_id) do update set role = 'admin';
```

Artık `/api/admin/login`'e bu e-posta/parola ile giriş yapılabilir. Admin işlemleri
`SUPABASE_SERVICE_ROLE_KEY` gerektirir (Adım 2).

---

## Güvenlik notu (üretime çıkmadan önce)

`supabase/schema.sql` içindeki RLS politikaları, hızlı başlangıç için **gevşek**
ayarlandı (giriş yapmış herkes çoğu tabloya yazabilir). Yetki kontrolü ayrıca API
route kodunda yapılıyor (önceki sistemdeki gibi). Gerçek üretim öncesi bu politikaları
"kullanıcı yalnızca kendi verisini değiştirebilir" şeklinde sıkılaştırman önerilir.
