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
/emailjs-config.js      ← file baru (opsional, untuk balas email di Kritik & Saran)
/admin.html            ← file baru
/parent.html            ← file baru (halaman pantauan orang tua)
```

`firebase-config.js` diimpor oleh `index.html`, `admin.html`, dan `parent.html`,
`emailjs-config.js` diimpor oleh `admin.html` — jadi semuanya harus berada di
folder yang sama (root) dengan file-file itu.

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

## Langkah 7 — Pembersihan Otomatis Sesi Live "Pantauan Orang Tua" (Gratis, Tanpa TTL)

Kalau akun Firestore Anda masih di plan gratis (Spark) dan tidak melihat opsi
TTL, tidak masalah — fitur ini didesain supaya **tetap otomatis bersih tanpa
TTL, tanpa Cloud Functions, dan tanpa upgrade plan apa pun**. Tidak ada langkah
setup tambahan di Firebase Console untuk ini.

Cara kerjanya: setiap dokumen sesi live punya field `expiresAt` (kedaluwarsa
4 jam sejak update terakhir). Alih-alih mengandalkan TTL server, setiap
browser yang membuka **game**, **admin.html**, atau **parent.html** ikut
membantu membersihkan sesi-sesi yang sudah lewat `expiresAt`-nya:
- Di **game** (`index.html`): dijalankan otomatis di background, maksimal
  1x per 6 jam per browser (dicatat di localStorage supaya tidak
  berulang-ulang pada satu perangkat).
- Di **admin.html**: dijalankan setiap kali superadmin berhasil login.
- Di **parent.html**: kalau orang tua kebetulan membuka sesi yang ternyata
  sudah kedaluwarsa (belum sempat terhapus), halaman itu langsung
  menghapusnya saat itu juga sambil menampilkan "Sesi Berakhir".

Karena ini murni query + delete biasa (bukan fitur premium), semuanya masuk
kuota gratis Firestore (read/write harian gratis Spark plan sudah lebih dari
cukup untuk pola pakai seperti ini).

## Cara Pakai — Pantauan Orang Tua

Saat anak bermain (setelah mengisi nama), tombol bulat 📡 muncul di pojok
kanan bawah. Tombol ini membuka kode sesi 6 karakter + QR code:
- **Orang tua scan QR** dari HP lain → langsung terhubung ke `parent.html`
  dan melihat progres secara **real-time** (level yang dimainkan, soal
  ke berapa, skor berjalan, benar/salah jawaban terakhir) — tanpa perlu
  install apa pun atau login.
- Atau orang tua bisa membuka `parent.html` sendiri lalu mengetik kode
  6 karakter secara manual.
- Anak bisa menutup sesi kapan saja lewat tombol **"🔴 Akhiri Sesi Pantau"**
  di modal yang sama.

**Soal auto-clear:** data sesi live otomatis terhapus saat:
1. Anak/orang tua menekan **"Akhiri Sesi Pantau"** (langsung, seketika).
2. Tab game ditutup — dicoba dibersihkan otomatis saat itu juga (best-effort,
   tidak 100% terjamin karena browser bisa memutus proses saat halaman
   ditutup).
3. **Pembersihan otomatis sisi client** (lihat Langkah 7 di atas) — jaring
   pengaman terakhir yang jalan otomatis lewat browser siapa pun yang buka
   game/dashboard/pantauan, sepenuhnya gratis, tanpa perlu TTL Firestore atau
   Cloud Functions.

Jadi datanya tidak akan menumpuk selamanya — selalu ada jalur pembersihannya,
dan semuanya kompatibel dengan akun Firestore gratis (Spark plan).

Catatan: QR code dibuat lewat layanan gratis `api.qrserver.com` (butuh
koneksi internet untuk menampilkan gambar QR-nya). Kalau QR gagal dimuat,
kode 6 karakter di bawahnya tetap bisa diketik manual di `parent.html`,
jadi fitur tetap berfungsi.

## Layar Anak Ikut Ditampilkan Live (Cermin Layar)

Di `parent.html`, selain skor & progres, orang tua sekarang juga melihat:
- **Soal yang sedang dikerjakan** (persis seperti tampil di layar anak,
  termasuk emoji untuk Mode Kode).
- **Jawaban yang sedang diketik anak** — update live tiap anak mengetik
  (dengan jeda kecil ~250ms supaya tidak membebani Firestore).
- **Legend Mode Kode** (simbol = angka) beserta status disembunyikan/
  ditampilkan, dan **timer memorizing** yang berjalan — semuanya sinkron
  dengan yang dilihat anak.

Tidak perlu setup tambahan untuk ini — otomatis aktif begitu fitur Pantauan
Orang Tua dipakai (Firestore sudah dikonfigurasi di langkah-langkah di atas).

---

## Kritik & Saran (dengan Balasan Email dari Superadmin)

Tombol 💬 di pojok kiri bawah halaman game membuka form Kritik & Saran:
Nama (opsional), Email (opsional — disebutkan jelas ke pemain bahwa ini
untuk keperluan dibalas), dan Pesan (wajib). Semua masukan masuk ke
collection `feedback` di Firestore dan bisa dibaca superadmin di
`admin.html`, bagian "💬 Kritik & Saran".

**Membalas masukan** hanya tersedia untuk masukan yang menyertakan email.
Ada 2 lapis:
1. **Selalu tersimpan** — balasan Anda otomatis tersimpan di Firestore
   (field `reply`) begitu Anda menekan "Kirim Balasan", terlepas dari
   langkah 2 berhasil atau tidak.
2. **Terkirim sungguhan ke email pemain** — ini opsional, lewat layanan
   gratis **EmailJS** (tanpa perlu server sendiri). Kalau belum
   dikonfigurasi, dashboard akan memberi tahu bahwa balasan tersimpan tapi
   email belum benar-benar terkirim.

### Setup EmailJS (opsional, gratis, ±5 menit)

1. Daftar di https://www.emailjs.com (free plan: 200 email/bulan, tanpa
   kartu kredit).
2. **Email Services** → **Add New Service** → hubungkan akun Gmail/Outlook
   Anda → salin **Service ID**.
3. **Email Templates** → **Create New Template**. Contoh isi template:
   ```
   Subject : Balasan untuk masukanmu di Game Matematika Anak

   Halo {{to_name}},

   Terima kasih sudah kirim masukan:
   "{{original_message}}"

   Berikut balasan dari kami:
   {{reply_message}}

   Salam,
   Tim Game Matematika Anak
   ```
   Pastikan kolom **"To Email"** di pengaturan template diisi `{{to_email}}`.
   Simpan, lalu salin **Template ID**.
4. **Account → General** → salin **Public Key**.
5. Buka file `emailjs-config.js`, isi ketiga nilai tadi:
   ```js
   export const emailjsConfig = {
     serviceId: 'service_xxxxxxx',
     templateId: 'template_xxxxxxx',
     publicKey: 'xxxxxxxxxxxxxxxx'
   };
   ```
6. Upload ulang `emailjs-config.js` ke hosting. Selesai — sekarang tombol
   "Kirim Balasan" di dashboard akan benar-benar mengirim email ke pemain.

Kalau Anda tidak ingin memakai fitur ini, biarkan `emailjs-config.js` kosong
seperti bawaannya — semua tetap berfungsi normal, hanya balasannya tidak
terkirim sebagai email sungguhan (hanya tersimpan di dashboard).

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
