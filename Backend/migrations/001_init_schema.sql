-- 001_init_schema.sql
-- Baseline schema for Dapoer NSR backend.
-- Non-destructive: only creates objects if they do not exist.

CREATE TABLE IF NOT EXISTS menu (
  menu_id BIGSERIAL PRIMARY KEY,
  nama_menu VARCHAR(150) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kategori (
  kategori_id BIGSERIAL PRIMARY KEY,
  nama_kategori VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS harga_menu (
  harga_menu_id BIGSERIAL PRIMARY KEY,
  menu_id BIGINT NOT NULL,
  kategori_id BIGINT NOT NULL,
  harga_satuan INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pesanan (
  pesanan_id BIGSERIAL PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  no_hp VARCHAR(30) NOT NULL,
  alamat TEXT NOT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  metode_pembayaran VARCHAR(50) NOT NULL,
  pengiriman VARCHAR(50) NOT NULL,
  total_harga INTEGER NOT NULL DEFAULT 0,
  ongkir INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pesanan_menu (
  pesanan_menu_id BIGSERIAL PRIMARY KEY,
  pesanan_id BIGINT NOT NULL,
  harga_menu_id BIGINT NOT NULL,
  qty INTEGER NOT NULL,
  harga_satuan INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_harga_menu_menu_id ON harga_menu(menu_id);
CREATE INDEX IF NOT EXISTS idx_harga_menu_kategori_id ON harga_menu(kategori_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_created_at ON pesanan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pesanan_menu_pesanan_id ON pesanan_menu(pesanan_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_menu_harga_menu_id ON pesanan_menu(harga_menu_id);
