# Xen-BinaAPK

Projek ini menukarkan aplikasi web kepada fail APK (Android) menggunakan **Capacitor**.

## Cara Membina (Build) Aplikasi Web ke APK

Sila ikuti langkah-langkah di bawah untuk membina (build) fail APK anda:

### Prasyarat

Pastikan komputer anda telah dipasang dengan:
1. **Node.js** dan **npm**
2. **Android Studio** (untuk membina fail APK bagi peranti Android)

### Langkah-langkah Membina APK

1. **Pasang Pakej NPM** (Sekiranya belum dipasang)
   Buka terminal di dalam folder projek ini dan jalankan arahan berikut untuk memasang semua kebergantungan (dependencies) Capacitor:
   ```bash
   npm install
   ```

2. **Segerak (Sync) Fail Web ke Capacitor**
   Setiap kali anda membuat sebarang perubahan pada fail web HTML/CSS/JS (yang berada di dalam folder `web/`), anda mesti menyegerakkan fail tersebut ke platform Android dengan arahan ini:
   ```bash
   npx cap sync android
   ```

3. **Buka Projek di Android Studio**
   Buka ruang kerja khusus Android menggunakan Android Studio:
   ```bash
   npx cap open android
   ```

4. **Bina (Build) APK di Android Studio**
   Setelah Android Studio dibuka, tunggu sebentar sehingga proses "Gradle Sync" di bahagian bawah skrin selesai. Setelah siap:
   - Klik pada menu atas: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
   - Tunggu proses pembinaan selesai (Android Studio akan mengambil sedikit masa).
   - Satu tetingkap kecil (pop-up) akan muncul di penjuru bawah kanan skrin. Klik pada pautan **"locate"** untuk membuka folder tempat fail APK anda disimpan (biasanya dinamakan `app-debug.apk`).

Selesai! Fail APK tersebut kini sedia untuk dipasang pada peranti bimbit Android anda.