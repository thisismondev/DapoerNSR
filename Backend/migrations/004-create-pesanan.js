exports.shorthands = undefined;

exports.up = async (pgm) => {
  pgm.createTable(
    'pesanan',
    {
      pesanan_id: { type: 'bigserial', primaryKey: true },
      nama: { type: 'varchar(150)', notNull: true },
      no_hp: { type: 'varchar(30)', notNull: true },
      alamat: { type: 'text', notNull: true },
      status: { type: 'smallint', notNull: true, default: 1 },
      metode_pembayaran: { type: 'varchar(50)', notNull: true },
      pengiriman: { type: 'varchar(50)', notNull: true },
      total_harga: { type: 'integer', notNull: true, default: 0 },
      ongkir: { type: 'integer', notNull: true, default: 0 },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );

  await pgm.db.query(`
    INSERT INTO pesanan (
      pesanan_id,
      nama,
      no_hp,
      alamat,
      status,
      metode_pembayaran,
      pengiriman,
      total_harga,
      ongkir,
      created_at
    )
    VALUES
      (
        1,
        'customer_0001',
        '08XXXXXXXX01',
        'address_masked_0001',
        1,
        'cash',
        '2026-04-15T14:30:00+08:00',
        180000,
        5000,
        '2026-04-15T02:34:33.380Z'
      )
    ON CONFLICT DO NOTHING
  `);

  await pgm.db.query(`
    SELECT setval(
      'pesanan_pesanan_id_seq',
      COALESCE((SELECT MAX(pesanan_id) FROM pesanan), 1),
      (SELECT COUNT(*) > 0 FROM pesanan)
    )
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query('DELETE FROM pesanan WHERE pesanan_id IN (1)');
  pgm.dropTable('pesanan', { ifExists: true, cascade: true });
};
