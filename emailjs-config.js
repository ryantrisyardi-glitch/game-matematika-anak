// ============================================================
// KONFIGURASI EMAILJS (opsional)
// ============================================================
// Dipakai HANYA di admin.html, untuk fitur "Balas via Email" pada
// Kritik & Saran yang penulisnya mencantumkan alamat email.
//
// Kalau tidak diisi, fitur balas tetap berfungsi (balasan tersimpan
// di dashboard), hanya saja TIDAK mengirim email sungguhan ke penulisnya.
//
// Cara mendapatkan nilainya (gratis, tanpa kartu kredit):
// 1. Daftar di https://www.emailjs.com (free plan: 200 email/bulan)
// 2. Email Services → Add New Service → hubungkan akun Gmail/Outlook Anda
//    → salin "Service ID"
// 3. Email Templates → Create New Template. Isi template balasan, contoh:
//      Subject : Balasan untuk masukanmu di Game Matematika Anak
//      Body    :
//        Halo {{to_name}},
//
//        Terima kasih sudah kirim masukan:
//        "{{original_message}}"
//
//        Berikut balasan dari kami:
//        {{reply_message}}
//
//        Salam,
//        Tim Game Matematika Anak
//    Pastikan field "To email" di pengaturan template diisi {{to_email}}.
//    → salin "Template ID"
// 4. Account → General → salin "Public Key"
// 5. Tempel ketiga nilai itu di bawah ini.
// ============================================================

export const emailjsConfig = {
  serviceId: 'service_sjve8gr',   // contoh: 'service_abc1234'
  templateId: 'template_pbd6xw4',  // contoh: 'template_xyz5678'
  publicKey: 'tZquaLtGjOx_Abndd'    // contoh: 'AbCdEfGhIjKlMnOp'
};
