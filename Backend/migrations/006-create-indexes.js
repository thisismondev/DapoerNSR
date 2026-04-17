exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createIndex('harga_menu', 'menu_id', {
    name: 'idx_harga_menu_menu_id',
    ifNotExists: true,
  });

  pgm.createIndex('harga_menu', 'kategori_id', {
    name: 'idx_harga_menu_kategori_id',
    ifNotExists: true,
  });

  pgm.createIndex('pesanan', 'created_at', {
    name: 'idx_pesanan_created_at',
    ifNotExists: true,
  });

  pgm.createIndex('pesanan', 'status', {
    name: 'idx_pesanan_status',
    ifNotExists: true,
  });

  pgm.createIndex('pesanan_menu', 'pesanan_id', {
    name: 'idx_pesanan_menu_pesanan_id',
    ifNotExists: true,
  });

  pgm.createIndex('pesanan_menu', 'harga_menu_id', {
    name: 'idx_pesanan_menu_harga_menu_id',
    ifNotExists: true,
  });
};

exports.down = async (pgm) => {
  await pgm.db.query('DROP INDEX IF EXISTS idx_pesanan_menu_harga_menu_id');
  await pgm.db.query('DROP INDEX IF EXISTS idx_pesanan_menu_pesanan_id');
  await pgm.db.query('DROP INDEX IF EXISTS idx_pesanan_status');
  await pgm.db.query('DROP INDEX IF EXISTS idx_pesanan_created_at');
  await pgm.db.query('DROP INDEX IF EXISTS idx_harga_menu_kategori_id');
  await pgm.db.query('DROP INDEX IF EXISTS idx_harga_menu_menu_id');
};
