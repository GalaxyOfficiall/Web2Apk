# Web2APK Dashboard - Vercel Deployment

## Struktur Project

```
web2apk-vercel/
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js
│   │   ├── verify.js
│   │   └── logout.js
│   ├── stats.js
│   ├── specs.js
│   ├── build.js            # Disabled (return 503)
│   ├── build-zip.js        # Disabled (return 503)
│   ├── logs.js
│   └── notification.js
├── lib/
│   └── licenseKeyService.js  # License manager (stateless)
├── public/                 # Static frontend files
│   ├── index.html
│   ├── login.html
│   ├── css/style.css
│   └── js/app.js
├── vercel.json
└── package.json
```

---

## Cara Deploy ke Vercel

### Langkah 1 — Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/web2apk-dashboard.git
git push -u origin main
```

### Langkah 2 — Import di Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo GitHub kamu
3. Biarkan semua setting default (Vercel auto-detect)
4. Klik **Deploy**

### Langkah 3 — Set Environment Variables

Di Vercel Dashboard → **Settings → Environment Variables**, tambahkan:

#### `TOKEN_SECRET`
String random panjang untuk sign token session.
Contoh: `my-super-secret-token-abc123xyz789`

#### `KEYS_JSON`
JSON berisi semua license key pengguna. Format:

```json
{
  "namauser1": {
    "key": "ABCD1234EFGH5678",
    "expiresAt": "2027-01-01T00:00:00.000Z",
    "telegramId": null
  },
  "namauser2": {
    "key": "WXYZ9876MNOP5432",
    "expiresAt": "2026-12-31T00:00:00.000Z",
    "telegramId": null
  }
}
```

> **Cara generate `key`:** Bisa pakai string 16 karakter huruf besar + angka.
> Contoh: `ABCD1234EFGH5678`

### Langkah 4 — Redeploy

Setelah set env vars, klik **Redeploy** agar perubahan aktif.

---

## Cara Tambah / Edit User

Karena Vercel serverless tidak bisa write file, manajemen user dilakukan dengan **edit env var `KEYS_JSON`** langsung di Vercel dashboard, lalu **Redeploy**.

### Contoh menambah user baru:

```json
{
  "namauser1": {
    "key": "ABCD1234EFGH5678",
    "expiresAt": "2027-01-01T00:00:00.000Z",
    "telegramId": null
  },
  "userBaru": {
    "key": "NEWK3Y12ABCD3456",
    "expiresAt": "2026-06-30T00:00:00.000Z",
    "telegramId": null
  }
}
```

---

## Cara Login (User)

1. Buka URL Vercel kamu (misal: `https://web2apk.vercel.app`)
2. Masukkan **username** dan **license key** sesuai `KEYS_JSON`
3. Dashboard akan terbuka

---

## Catatan Penting

| Hal | Keterangan |
|-----|------------|
| Build APK | ❌ Tidak tersedia (butuh VPS) |
| Login/Auth | ✅ Stateless JWT-style token |
| Data permanen | ✅ Tersimpan di env var Vercel |
| Rate limiting | ✅ Per serverless instance |
| HTTPS | ✅ Otomatis dari Vercel |
