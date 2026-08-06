// ============================================================
// KONFIGURASI FIREBASE
// ============================================================
// Ganti semua nilai di bawah ini dengan kredensial project Firebase Anda.
// Cara mendapatkannya: Firebase Console → Project Settings → General →
// "Your apps" → pilih/buat Web App → salin objek firebaseConfig.
//
// File ini dipakai bersama oleh index.html (game) dan admin.html (dashboard).
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyBMyJzhvk-oflbeWowGjfOs2iNUEd0kDAI",
  authDomain: "game-matematika-anak-1ef6b.firebaseapp.com",
  projectId: "game-matematika-anak-1ef6b",
  storageBucket: "game-matematika-anak-1ef6b.firebasestorage.app",
  messagingSenderId: "527926717736",
  appId: "1:527926717736:web:998e8bc3e627b9ef99f41d",
  measurementId: "G-J1P14L0QYP"
};

// Email superadmin yang diizinkan membuka admin.html
export const SUPERADMIN_EMAIL = "ryan.trisyardi@gmail.com";
