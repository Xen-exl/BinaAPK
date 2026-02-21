# Xen-BinaAPK (Pusat Pembina Web ke APK)

Projek ini adalah sebuah sistem pembina (Builder) beasaskan laman web yang menukarkan aplikasi web HTML/JS/CSS anda kepada fail APK (Android) secara automatik menggunakan **Capacitor dan GitHub Actions**.

Ia direka untuk dihoskan (hosted) di **Vercel**, di mana pengguna boleh memasukkan URL repository mereka di laman web, dan sistem penukaran APK akan berjalan di belakang tabir.

## Cara Pemasangan (Deploy ke Vercel)

Memandangkan kompilasi Android (Java/Gradle) sangat berat, projek ini menggunakan seni bina *"Central Builder"*. Web di Vercel hanya bertindak sebagai Antaramuka (UI), manakala kerja sebenar dilakukan oleh GitHub Actions di repository ini.

### 1. Fork Repository Ini
Sila "Fork" repository `Xen-BinaAPK` ini ke akaun GitHub anda.

### 2. Dapatkan GitHub PAT (Personal Access Token)
Untuk membolehkan Vercel menghidupkan (trigger) GitHub Actions secara automatik:
- Pergi ke **GitHub Settings -> Developer Settings -> Personal access tokens (Tokens (classic))**.
- Klik **Generate new token (classic)**.
- Beri kebenaran (scope): `repo` dan `workflow`.
- Salin token tersebut (contoh: `ghp_xxxxxxxxxxxx`).

### 3. Deploy ke Vercel
- Log masuk ke [Vercel](https://vercel.com/) dan tambah projek baharu dari repository GitHub anda yang telah di-"Fork".
- Sebelum klik **Deploy**, pergi ke bahagian **Environment Variables**.
- Tambahkan:
  - Key: `GITHUB_PAT`
  - Value: *(Tampal token yang disalin tadi)*
- Klik **Deploy**.

## Cara Penggunaan (Selepas Deploy)

1. Buka laman web Vercel anda.
2. Masukkan URL Repository Web anda (contoh: `username/web-app-saya`).
3. Masukkan Token GitHub anda (sama seperti token di atas, atau token bacaan pengguna). Token ini digunakan oleh sistem pembina untuk memuat naik fail APK ke bahagian *Releases* repository anda.
4. Klik **Mulakan Proses Bina APK**.
5. Proses akan berjalan selama kira-kira 2-3 minit. Sila semak tab **Actions** atau **Releases** di repository web anda untuk memuat turun fail APK!