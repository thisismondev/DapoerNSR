Berikut perintah yang bisa Anda pakai untuk dev, prod, dan migration baru.

Untuk aplikasi:

- Dev: `npm run dev` atau `npm run start:dev`
- Prod: `npm run start:prod`
- Docker/production startup: `npm run start:docker`

Untuk migration:

- Jalankan migration ke dev: `npm run migrate:dev`
- Rollback migration di dev: `npm run migrate:dev:down`
- Jalankan migration ke prod: `npm run migrate:prod`
- Rollback migration di prod: `npm run migrate:prod:down`
- Buat migration baru: `npm run migrate:create`

Cara kerja env-nya:

- Dev memakai `APP_ENV=dev` dan `DATABASE_URL_DEV`
- Prod memakai `APP_ENV=prod` dan `DATABASE_URL_PROD`

Contoh alur yang aman:

1. Buat file migration baru.
2. Jalankan `npm run migrate:dev`.
3. Test fitur di dev.
4. Kalau sudah aman, deploy code yang sama.
5. Jalankan `npm run migrate:prod`.
