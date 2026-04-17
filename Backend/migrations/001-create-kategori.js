exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.createTable(
    'kategori',
    {
      kategori_id: { type: 'bigserial', primaryKey: true },
      nama_kategori: { type: 'varchar(150)', notNull: true },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  await pgm.db.query(`
    INSERT INTO kategori (kategori_id, nama_kategori, created_at)
    VALUES
      (1, 'Kecil', '2026-04-15T02:28:03.595Z'),
      (2, 'Sedang', '2026-04-15T02:28:03.636Z'),
      (3, 'Besar', '2026-04-15T02:28:03.642Z')
    ON CONFLICT DO NOTHING
  `);

  await pgm.db.query(`
    SELECT setval(
      'kategori_kategori_id_seq',
      COALESCE((SELECT MAX(kategori_id) FROM kategori), 1),
      (SELECT COUNT(*) > 0 FROM kategori)
    )
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query('DELETE FROM kategori WHERE kategori_id IN (1, 2, 3)');
  pgm.dropTable('kategori', { ifExists: true, cascade: true });
};
