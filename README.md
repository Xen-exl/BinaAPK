# Xen-BinaAPK

Selamat datang ke **Xen-BinaAPK**, platform mudah untuk menukarkan aplikasi web HTML/JS/CSS anda kepada fail pemasangan Android (.apk) secara automatik!

Anda tidak perlu memuat turun Android Studio atau memahami sistem kod yang rumit. Semuanya dilakukan di atas talian (online) terus ke dalam akaun GitHub anda.

## Cara Menggunakan Xen-BinaAPK

Untuk membina APK aplikasi web anda, ikuti tiga langkah mudah di bawah.

### Langkah 1: Sediakan Repository Web Anda
Pastikan kod sumber laman web anda (HTML, CSS, JS) telah dimuat naik ke dalam sebuah repository GitHub yang berstatus `Public` atau `Private`.

### Langkah 2: Dapatkan GitHub Access Token Anda
Sistem The Xen-BinaAPK memerlukan kebenaran sementara untuk membaca fail web anda dan memuat naik fail APK yang telah siap ke repository anda.
1. Log masuk ke akaun GitHub anda.
2. Pergi ke **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
   *(Atau klik pautan pantas ini: [Semat Token Baru](https://github.com/settings/tokens/new))*
3. Letakkan apa-apa nama pada ruang **Note** (cth: `BinaAPK`).
4. Pada bahagian **Select scopes**, tandakan (tick) ruangan berikut:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Skrol ke bawah dan klik **Generate token**.
6. **Salin token tersebut (bermula dengan `ghp_...`).** Simpan token ini kerana ia tidak akan dipaparkan lagi.

### Langkah 3: Mula Membina APK!
1. Buka laman web Xen-BinaAPK kami.
2. Masukkan maklumat berikut dalam borang yang disediakan:
   - **URL / Nama Repository**: Letakkan format `username/repo-anda` (cth: `Xen-exl/laman-web-syarikat`).
   - **GitHub Access Token**: Tampal token `ghp_...` yang anda salin pada *Langkah 2*.
   - **Nama Aplikasi**: Nama yang akan terpapar di skrin telefon anda (cth: `My Kedai`).
   - **App ID (Pakej)**: ID unik untuk aplikasi anda (cth: `com.mykedai.app`).
3. Klik **Mulakan Proses Bina APK**.

## Tempoh Menunggu & Memuat Turun
Proses pembinaan APK akan mengambil masa sekitar **2 hingga 4 minit**. Anda boleh menyemak perkembangannya di tab **Actions** pada halaman repository GitHub anda sendiri.

Setelah selesai, fail `app-debug.apk` akan berada di bahagian **Releases** di repository GitHub anda sedia untuk dimuat turun ke dalam telefon pintar Android!