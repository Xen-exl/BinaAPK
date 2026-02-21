# Xen-BinaAPK

Projek ini menukarkan aplikasi web kepada fail APK (Android) menggunakan **Capacitor** secara automatik menggunakan GitHub Actions.

## Cara Membina (Build) Aplikasi Web ke APK (Secara Automatik)

Anda tidak lagi memerlukan Android Studio di komputer anda. Semua proses akan dijalankan secara automatik di pelayan GitHub.

Sila ikuti langkah-langkah mudah di bawah:

### 1. Kemas Kini Fail Web Anda
Masukkan atau kemas kini kod HTML/CSS/JS anda ke dalam folder `web/`.

### 2. Tolak (Push) Perubahan ke GitHub
Setelah selesai mengemas kini fail, tolak (commit & push) perubahan tersebut ke repository GitHub:
```bash
git add .
git commit -m "update: fail web terkini"
git push origin main
```

### 3. Cipta "Tag" Versi Baharu (Untuk Release Automatik)
Untuk mencetuskan sistem pembinaan (build) automatik dan menjana fail APK di halaman *Releases*, anda perlu meletakkan tag versi bermula dengan huruf `v` (contoh: `v1.0.0`):
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 4. Muat Turun Fail APK
- Buka repository GitHub anda di pelayar web (https://github.com/Xen-exl/Xen-BinaAPK).
- Pergi ke tab **Actions**. Anda boleh melihat proses *build* sedang berjalan.
- Setelah proses memaparkan tanda semak hijau (Berjaya/Success), pergi ke panel kanan halaman utama repository dan klik pada **Releases**.
- Fail APK (`app-debug.apk`) sedia untuk dimuat turun dan dipasang pada peranti Android anda!

> **Cara Alternatif (Manual Trigger):**
> Anda juga boleh memulakannya secara manual dengan pergi ke tab **Actions** -> pilih **Build and Release Android APK** -> klik **Run workflow**. Fail APK akan dimuat naik sebagai "Artifact" di hujung proses *build* tersebut tanpa berada di halaman Releases.