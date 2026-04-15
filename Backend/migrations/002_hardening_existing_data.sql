-- 002_hardening_existing_data.sql
-- Hardening migration for existing data.
-- Non-destructive: backfills safe defaults and enforces integrity checks.

ALTER TABLE menu ADD COLUMN IF NOT EXISTS nama_menu VARCHAR(150);
ALTER TABLE menu ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menu ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE kategori ADD COLUMN IF NOT EXISTS nama_kategori VARCHAR(150);
ALTER TABLE kategori ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE harga_menu ADD COLUMN IF NOT EXISTS menu_id BIGINT;
ALTER TABLE harga_menu ADD COLUMN IF NOT EXISTS kategori_id BIGINT;
ALTER TABLE harga_menu ADD COLUMN IF NOT EXISTS harga_satuan INTEGER;
ALTER TABLE harga_menu ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS nama VARCHAR(150);
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30);
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS alamat TEXT;
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS status SMALLINT;
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS metode_pembayaran VARCHAR(50);
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS pengiriman VARCHAR(50);
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS total_harga INTEGER;
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS ongkir INTEGER;
ALTER TABLE pesanan ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE pesanan_menu ADD COLUMN IF NOT EXISTS pesanan_id BIGINT;
ALTER TABLE pesanan_menu ADD COLUMN IF NOT EXISTS harga_menu_id BIGINT;
ALTER TABLE pesanan_menu ADD COLUMN IF NOT EXISTS qty INTEGER;
ALTER TABLE pesanan_menu ADD COLUMN IF NOT EXISTS harga_satuan INTEGER;
ALTER TABLE pesanan_menu ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE pesanan ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE pesanan ALTER COLUMN total_harga SET DEFAULT 0;
ALTER TABLE pesanan ALTER COLUMN ongkir SET DEFAULT 0;

UPDATE pesanan SET status = 1 WHERE status IS NULL;
UPDATE pesanan SET total_harga = 0 WHERE total_harga IS NULL;
UPDATE pesanan SET ongkir = 0 WHERE ongkir IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM menu WHERE nama_menu IS NULL) THEN
    RAISE EXCEPTION 'NULL found in menu.nama_menu. Please backfill values before migration can continue.';
  END IF;

  IF EXISTS (SELECT 1 FROM kategori WHERE nama_kategori IS NULL) THEN
    RAISE EXCEPTION 'NULL found in kategori.nama_kategori. Please backfill values before migration can continue.';
  END IF;

  IF EXISTS (SELECT 1 FROM harga_menu WHERE menu_id IS NULL OR kategori_id IS NULL OR harga_satuan IS NULL) THEN
    RAISE EXCEPTION 'NULL found in harga_menu key columns. Please backfill values before migration can continue.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pesanan
    WHERE nama IS NULL
      OR no_hp IS NULL
      OR alamat IS NULL
      OR metode_pembayaran IS NULL
      OR pengiriman IS NULL
  ) THEN
    RAISE EXCEPTION 'NULL found in pesanan required columns. Please backfill values before migration can continue.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pesanan_menu
    WHERE pesanan_id IS NULL
      OR harga_menu_id IS NULL
      OR qty IS NULL
      OR harga_satuan IS NULL
  ) THEN
    RAISE EXCEPTION 'NULL found in pesanan_menu required columns. Please backfill values before migration can continue.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM harga_menu
    GROUP BY menu_id, kategori_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate (menu_id, kategori_id) found in harga_menu. Please deduplicate before migration can continue.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM harga_menu hm
    LEFT JOIN menu m ON m.menu_id = hm.menu_id
    WHERE m.menu_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Orphan rows found: harga_menu.menu_id has no matching menu.menu_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM harga_menu hm
    LEFT JOIN kategori k ON k.kategori_id = hm.kategori_id
    WHERE k.kategori_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Orphan rows found: harga_menu.kategori_id has no matching kategori.kategori_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pesanan_menu pm
    LEFT JOIN pesanan p ON p.pesanan_id = pm.pesanan_id
    WHERE p.pesanan_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Orphan rows found: pesanan_menu.pesanan_id has no matching pesanan.pesanan_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pesanan_menu pm
    LEFT JOIN harga_menu hm ON hm.harga_menu_id = pm.harga_menu_id
    WHERE hm.harga_menu_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Orphan rows found: pesanan_menu.harga_menu_id has no matching harga_menu.harga_menu_id';
  END IF;
END
$$;

ALTER TABLE menu ALTER COLUMN nama_menu SET NOT NULL;
ALTER TABLE kategori ALTER COLUMN nama_kategori SET NOT NULL;
ALTER TABLE harga_menu ALTER COLUMN menu_id SET NOT NULL;
ALTER TABLE harga_menu ALTER COLUMN kategori_id SET NOT NULL;
ALTER TABLE harga_menu ALTER COLUMN harga_satuan SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN nama SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN no_hp SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN alamat SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN status SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN metode_pembayaran SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN pengiriman SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN total_harga SET NOT NULL;
ALTER TABLE pesanan ALTER COLUMN ongkir SET NOT NULL;
ALTER TABLE pesanan_menu ALTER COLUMN pesanan_id SET NOT NULL;
ALTER TABLE pesanan_menu ALTER COLUMN harga_menu_id SET NOT NULL;
ALTER TABLE pesanan_menu ALTER COLUMN qty SET NOT NULL;
ALTER TABLE pesanan_menu ALTER COLUMN harga_satuan SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_harga_menu_menu_kategori'
      AND conrelid = 'harga_menu'::regclass
  ) THEN
    ALTER TABLE harga_menu
      ADD CONSTRAINT uq_harga_menu_menu_kategori UNIQUE (menu_id, kategori_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_harga_menu_menu'
      AND conrelid = 'harga_menu'::regclass
  ) THEN
    ALTER TABLE harga_menu
      ADD CONSTRAINT fk_harga_menu_menu
      FOREIGN KEY (menu_id)
      REFERENCES menu(menu_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_harga_menu_kategori'
      AND conrelid = 'harga_menu'::regclass
  ) THEN
    ALTER TABLE harga_menu
      ADD CONSTRAINT fk_harga_menu_kategori
      FOREIGN KEY (kategori_id)
      REFERENCES kategori(kategori_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_pesanan_menu_pesanan'
      AND conrelid = 'pesanan_menu'::regclass
  ) THEN
    ALTER TABLE pesanan_menu
      ADD CONSTRAINT fk_pesanan_menu_pesanan
      FOREIGN KEY (pesanan_id)
      REFERENCES pesanan(pesanan_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_pesanan_menu_harga_menu'
      AND conrelid = 'pesanan_menu'::regclass
  ) THEN
    ALTER TABLE pesanan_menu
      ADD CONSTRAINT fk_pesanan_menu_harga_menu
      FOREIGN KEY (harga_menu_id)
      REFERENCES harga_menu(harga_menu_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_harga_menu_menu_id ON harga_menu(menu_id);
CREATE INDEX IF NOT EXISTS idx_harga_menu_kategori_id ON harga_menu(kategori_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_created_at ON pesanan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pesanan_menu_pesanan_id ON pesanan_menu(pesanan_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_menu_harga_menu_id ON pesanan_menu(harga_menu_id);
