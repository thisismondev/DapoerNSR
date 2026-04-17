exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.createTable(
    'pesanan_menu',
    {
      pesanan_menu_id: { type: 'bigserial', primaryKey: true },
      pesanan_id: {
        type: 'bigint',
        notNull: true,
        references: 'pesanan(pesanan_id)',
        onDelete: 'cascade',
      },
      harga_menu_id: {
        type: 'bigint',
        notNull: true,
        references: 'harga_menu(harga_menu_id)',
        onDelete: 'cascade',
      },
      qty: { type: 'integer', notNull: true },
      harga_satuan: { type: 'integer', notNull: true },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  await pgm.db.query(`
    INSERT INTO pesanan_menu (pesanan_menu_id, pesanan_id, harga_menu_id, qty, harga_satuan, created_at)
    VALUES
      (1, 1, 1, 2, 60000, '2026-04-15T02:34:33.380Z'),
      (2, 1, 2, 4, 15000, '2026-04-15T02:34:33.380Z')
    ON CONFLICT DO NOTHING
  `);

  await pgm.db.query(`
    SELECT setval(
      'pesanan_menu_pesanan_menu_id_seq',
      COALESCE((SELECT MAX(pesanan_menu_id) FROM pesanan_menu), 1),
      (SELECT COUNT(*) > 0 FROM pesanan_menu)
    )
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query('DELETE FROM pesanan_menu WHERE pesanan_menu_id IN (1, 2)');
  pgm.dropTable('pesanan_menu', { ifExists: true, cascade: true });
};
