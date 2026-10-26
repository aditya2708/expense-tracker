# AGENTS.md

Project: personal expense tracker — Laravel API + React Router SPA. Peta produk dan scope di `CONTEXT.md`; istilah domain di `GLOSSARY.md`.

## Environment (diverifikasi 2026-10-27)
- Windows 11 + PowerShell 7.6.6: perintah shell memakai sintaks PowerShell, bukan bash.
- PHP 8.5.11 lewat Laravel Herd (`C:\Program Files\Herd`); `backend/composer.json` meminta `^8.3`.
- Composer 2.9.5. Node 22.22.2 / npm 11.13.0.
- `npm` diblokir execution policy: `npm.ps1` menolak jalan. Pakai `npm.cmd`, atau `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` sekali.
- `backend/.env` menunjuk `pgsql` di `127.0.0.1:5432`, tetapi tidak ada Postgres yang berjalan (port tertutup, `psql` tidak di PATH, tidak ada service). Nyalakan instance Postgres sebelum migrate atau menjalankan dev server.
- Test tidak terpengaruh: `phpunit.xml` memaksa SQLite `:memory:`.
- Docker tidak tersedia di PATH; bun dan deno tidak terinstal.

## Verifikasi
- Setelah mengubah kode, jalankan test yang relevan sebelum menyatakan selesai; perubahan non-kode boleh dilewati.
- Jangan klaim "sudah teruji" bila test tidak benar-benar dijalankan — sebutkan alasannya.
- Jangan jalankan perintah destruktif (migrate, seed, wipe) tanpa izin, meskipun untuk keperluan test.

## Konvensi Kerja
- Cari perintah asli dari manifest/script project (`composer.json`, `package.json`, README) sebelum menjalankan apa pun — jangan mengarang perintah.
- Aturan khusus project ditulis di `AGENTS.md` root project tersebut (file terdekat yang menang), bukan di file ini.
- Jangan tambah atau update dependency tanpa izin user.
- Jangan commit atau push kecuali diminta eksplisit.
- Jangan pernah commit `.env`/secret dan jangan hardcode credential di kode.
- Jangan edit file generated atau build artifact secara manual.

## Error Handling
- Tangkap error hanya di boundary yang tepat; jangan bungkus setiap panggilan dengan try/catch dan jangan pernah menelan error diam-diam.
- Backend: pesan error yang jelas + status code yang tepat. Detail teknis (stack trace, query, nama internal) cukup di log, jangan dikirim ke client.
- Frontend: tampilkan pesan yang bisa dipahami user, bukan "Something went wrong" tanpa konteks; sediakan aksi lanjutan jika ada (coba lagi/kembali).
- Validasi input di backend dengan pesan per-field yang jelas; validasi frontend hanya untuk UX, sumber kebenaran tetap backend.
- Log error server dengan konteks yang cukup (request/user terkait) tanpa mencatat secret atau data sensitif.

## Alur Implementasi
- Klasifikasikan dulu: perubahan kecil dan jelas → langsung kerjakan. Perubahan besar, lintas modul, atau ambigu → ajukan rencana singkat (scope, file, langkah, risiko) dan konfirmasi sebelum mulai.
- Jika terlalu berat untuk sekali jalan, pecah menjadi fase yang bisa diverifikasi satu per satu; sebutkan urutannya dan mulai dari fase pertama, jangan paksakan semua sekaligus.
- Jangan diam-diam menyederhanakan permintaan (implementasi "seadanya") lalu mengklaim selesai; sampaikan bagian yang ditunda atau tidak bisa dikerjakan beserta alasannya.
- Ubah asumsi besar menjadi pertanyaan yang memblokir saja; jangan menebak lalu membangun di atas tebakan.

## UI/UX (default minimalis, web & mobile)
- Tampilkan hanya elemen yang menambah informasi atau aksi; hapus teks pengisi, tagline, teks sambutan, dan deskripsi yang mengulang.
- Label pendek lebih baik daripada kalimat; jangan generate konten yang tidak diminta.
- Hemat ruang: hindari padding/margin berlebihan, heading bertingkat yang mengulang, card bertumpuk, dan area kosong besar.
- Dekorasi (ikon, emoji, ilustrasi) hanya jika memperjelas aksi atau status.
- Ikuti design system/token yang sudah ada; jangan menciptakan gaya baru per layar.
- Minimalis tetap harus bisa dipakai: jaga kontras, ukuran target sentuh, dan pesan error yang jelas.
- Ragu antara menambah elemen atau tidak → jangan tambah.

## Komunikasi
- Balas dalam bahasa Indonesia yang ringkas; istilah teknis boleh tetap dalam bahasa Inggris.

## Agent skills

### Issue tracker

Issues live as GitHub issues, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five default roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
