exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.createTable(
    'menu',
    {
      menu_id: { type: 'bigserial', primaryKey: true },
      nama_menu: { type: 'varchar(150)', notNull: true },
      image_url: { type: 'text' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  pgm.sql(`
    INSERT INTO menu (menu_id, nama_menu, image_url, created_at)
    VALUES
      (1, 'Songkolo', NULL, '2026-04-15T02:28:45.625Z'),
      (2, 'Candil', NULL, '2026-04-15T02:28:45.639Z')
    ON CONFLICT DO NOTHING
  `);

  pgm.sql(`
    SELECT setval(
      'menu_menu_id_seq',
      COALESCE((SELECT MAX(menu_id) FROM menu), 1),
      (SELECT COUNT(*) > 0 FROM menu)
    )
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query('DELETE FROM menu WHERE menu_id IN (1, 2)');
  pgm.dropTable('menu', { ifExists: true, cascade: true });
};
