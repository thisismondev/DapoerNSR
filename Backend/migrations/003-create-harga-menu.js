exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.createTable(
    'harga_menu',
    {
      harga_menu_id: { type: 'bigserial', primaryKey: true },
      menu_id: {
        type: 'bigint',
        notNull: true,
        references: 'menu(menu_id)',
        onDelete: 'cascade',
      },
      kategori_id: {
        type: 'bigint',
        notNull: true,
        references: 'kategori(kategori_id)',
        onDelete: 'cascade',
      },
      harga_satuan: { type: 'integer', notNull: true },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    INSERT INTO harga_menu (harga_menu_id, menu_id, kategori_id, harga_satuan, created_at)
    VALUES
      (1, 1, 2, 60000, '2026-04-15T02:29:56.493Z'),
      (2, 2, 3, 15000, '2026-04-15T02:29:56.520Z'),
      (3, 2, 2, 10000, '2026-04-15T02:29:56.526Z'),
      (4, 1, 3, 110000, '2026-04-15T02:29:56.531Z')
    ON CONFLICT DO NOTHING
  `);

  pgm.sql(`
    SELECT setval(
      'harga_menu_harga_menu_id_seq',
      COALESCE((SELECT MAX(harga_menu_id) FROM harga_menu), 1),
      (SELECT COUNT(*) > 0 FROM harga_menu)
    )
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query('DELETE FROM harga_menu WHERE harga_menu_id IN (1, 2, 3, 4)');
  pgm.dropTable('harga_menu', { ifExists: true, cascade: true });
};
