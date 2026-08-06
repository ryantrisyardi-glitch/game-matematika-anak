# Setup Fitur Analytics (Firestore) — Game Matematika Anak

Fitur ini menambahkan 2 hal:
1. **Simpan nama & hasil main** setiap kali anak selesai bermain.
2. **Dashboard admin** (`admin.html`) untuk melihat data pengunjung: lokasi, device,
   OS, browser, sumber kunjungan, jam sibuk, pengunjung berulang, dan log detail
   yang bisa difilter (semua/admin/tamu, tanggal, jam).

File baru yang ditambahkan:
- `firebase-config.js` — kredensial project Firebase (WAJIB diisi manual).
- `firestore.rules` — aturan keamanan database.
- `admin.html` — dashboard khusus superadmin.

Perubahan pada `index.html`: menambahkan modul kecil yang mengirim data kunjungan
& hasil ke Firestore, tanpa mengubah cara main game sama sekali.

---

## Langkah 1 — Buat Project Firebase

1. Buka https://console.firebase.google.com → **Add project** → beri nama
   (misalnya `game-matematika-anak`) → ikuti wizard sampai selesai.
2. Di dalam project, klik ikon **Web (`</>`)** untuk mendaftarkan web app baru
   → beri nickname → **Register app**.
3. Firebase akan menampilkan objek `firebaseConfig` seperti ini:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "game-matematika-anak.firebaseapp.com",
     projectId: "game-matematika-anak",
     storageBucket: "game-matematika-anak.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
4. **Salin nilai-nilai tersebut** ke file `firebase-config.js` (menggantikan
   semua tulisan `GANTI_...`).

## Langkah 2 — Aktifkan Firestore

1. Di sidebar Firebase Console → **Build → Firestore Database** → **Create database**.
2. Pilih lokasi server terdekat (misalnya `asia-southeast2 (Jakarta)`).
3. Mode: pilih **Production mode** (aturan keamanan akan kita isi manual di
   Langkah 4).

## Langkah 3 — Aktifkan Authentication & Buat Akun Superadmin

1. Sidebar → **Build → Authentication** → **Get started**.
2. Tab **Sign-in method** → aktifkan **Google** (pilih akun support email Anda,
   biasanya email project). Ini dipakai untuk tombol "Masuk dengan Google" baik
   di pojok halaman game (`index.html`) maupun di `admin.html`.
3. (Opsional, sebagai cadangan) aktifkan juga **Email/Password** jika suatu saat
   ingin login tanpa akun Google.
4. Pastikan Anda login Google dengan akun **`ryan.trisyardi@gmail.com`** saat
   mencoba tombol "Masuk dengan Google" — hanya email ini yang diizinkan
   sebagai admin (diatur di `firebase-config.js` & `firestore.rules`).

> Catatan: `SUPERADMIN_EMAIL` di `firebase-config.js` sudah diset ke
> `ryan.trisyardi@gmail.com`. Kalau suatu saat ingin ganti/menambah admin,
> ubah nilai ini **dan** aturan di `firestore.rules` (baris
> `request.auth.token.email == '...'`), lalu deploy ulang rules.

## Langkah 4 — Pasang Firestore Security Rules

1. Firestore Database → tab **Rules**.
2. Hapus isi default, ganti dengan isi file `firestore.rules` yang sudah
   disediakan (copy-paste seluruh isinya).
3. Klik **Publish**.

Ringkasan aturan tersebut:
- Siapa saja (tanpa login) boleh **menulis** data kunjungan/hasil (anonim) —
  supaya tracking pengunjung game bisa jalan tanpa perlu mereka login.
- Hanya `ryan.trisyardi@gmail.com` yang login lewat `admin.html` yang boleh
  **membaca** data tersebut.

## Langkah 5 — Upload File ke Hosting

Pastikan struktur folder di server/hosting Anda seperti ini (satu folder yang sama):

```
/index.html
/sw.js
/manifest.json
/firebase-config.js   ← file baru
/admin.html            ← file baru
```

`firebase-config.js` diimpor oleh `index.html` maupun `admin.html`, jadi harus
berada di folder yang sama (root) dengan keduanya.

## Langkah 6 — Coba

1. Buka game seperti biasa (`index.html`) dari HP/laptop lain → mainkan sampai
   selesai satu level.
2. Buka `admin.html` di browser → login dengan tombol **Masuk dengan Google**
   (pakai `ryan.trisyardi@gmail.com`).
3. Data kunjungan & hasil main tadi akan muncul di dashboard (mungkin perlu
   beberapa detik / refresh karena Firestore butuh waktu propagasi singkat).

## Main sebagai Admin & Buka Dashboard Langsung dari Game

Di pojok kanan atas halaman awal game ada tombol kecil 🔐. Tombol ini membuka
modal login — pakai **Masuk dengan Google** dengan akun
`ryan.trisyardi@gmail.com`. Setelah berhasil login:
- Kunjungan & hasil main Anda otomatis ditandai **"Admin"** (bukan "Tamu"),
  sehingga tidak mencampuri statistik pengunjung asli di dashboard.
- Muncul tombol **"📊 Buka Dashboard"** di modal yang sama, langsung membuka
  `admin.html` di tab baru — tanpa perlu mengetik alamat khusus.
- Karena sesi login Google tersimpan di browser (bukan hanya di satu halaman),
  begitu Anda login lewat game, `admin.html` juga otomatis mengenali Anda
  sebagai admin tanpa perlu login ulang (selama masih di browser & domain
  yang sama).

Cara lama (`?admin=ryan` di URL) tetap didukung sebagai cadangan, tapi kini
tidak wajib — cukup login Google dari tombol pojok tersebut.

---

## Catatan & Batasan

- **Geolokasi (kota/negara)** diambil dari layanan gratis `ipwho.is`
  berdasarkan IP publik pengunjung. Akurasi tergantung provider internet
  mereka (bisa meleset ke kota terdekat/pusat ISP, terutama untuk pengguna
  data seluler).
- **Deteksi sumber kunjungan** (WhatsApp/Instagram/dll) dilakukan dari
  `document.referrer` dan tanda pada User-Agent. WhatsApp seringkali tidak
  meninggalkan jejak referrer sama sekali (karena alasan privasi WhatsApp),
  sehingga kunjungan dari WhatsApp bisa saja tercatat sebagai
  "Langsung / Tidak diketahui". Untuk hasil paling akurat, tambahkan
  parameter `?src=whatsapp`, `?src=instagram`, dst. pada link yang Anda
  sebarkan di masing-masing platform.
- **Tandai kunjungan admin sendiri**: cara termudah sekarang adalah login lewat
  tombol 🔐 di pojok kanan atas halaman game menggunakan akun Google
  `ryan.trisyardi@gmail.com` — kunjungan otomatis ditandai "Admin". URL lama
  `?admin=ryan` tetap berfungsi sebagai cadangan.
- **Fitur berbagi (share)**: tombol "WhatsApp" & "Instagram" di layar hasil
  menambahkan parameter `?src=whatsapp` / `?src=instagram` pada link yang
  dibagikan, sehingga kunjungan dari link tersebut otomatis tercatat dengan
  sumber yang benar di dashboard. WhatsApp membuka jendela kirim pesan berisi
  link tersebut secara langsung. Instagram tidak menyediakan cara resmi untuk
  mengirim teks/link terprogram dari web (batasan platform Instagram sendiri),
  jadi tombol Instagram akan: (1) menyalin caption + link ke clipboard, dan
  (2) membuka jendela berbagi bawaan perangkat (memuat gambar hasil) supaya
  pengguna tinggal memilih Instagram dan menempelkan captionnya.
- Dashboard ini mengambil sampai **3000 log kunjungan** & **3000 hasil main**
  terbaru langsung dari browser (tanpa server backend). Ini sudah cukup untuk
  skala ribuan pengunjung/bulan. Jika traffic sudah sangat besar (puluhan ribu
  kunjungan/bulan) dan dashboard mulai terasa lambat, langkah berikutnya
  adalah memindahkan agregasi data ke Cloud Functions terjadwal — ini bisa
  didiskusikan lebih lanjut kalau sudah dibutuhkan.
- Firestore memiliki **free tier (Spark plan)**: 50.000 baca & 20.000 tulis
  per hari secara gratis — cukup untuk kebanyakan game edukasi skala menengah.
