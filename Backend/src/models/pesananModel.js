const pool = require('../config/db');

const STATUS_BELUM = 1;
const STATUS_BATAL = 3;

const createAppError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// ✅ CREATE
const createPesanan = async (data) => {
  const { nama, no_hp, alamat, metode_pembayaran, tgl_pengiriman, waktu_pengiriman, ongkir, items } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!Array.isArray(items) || items.length === 0) {
      throw createAppError('items pesanan wajib diisi');
    }

    const resultPesanan = await client.query(
      `INSERT INTO pesanan 
            (nama, no_hp, alamat, status, metode_pembayaran, tgl_pengiriman, waktu_pengiriman, total_harga, ongkir)
            VALUES ($1,$2,$3,$4,$5,$6,$7,0,$8)
            RETURNING pesanan_id`,
      [nama, no_hp, alamat, STATUS_BELUM, metode_pembayaran, tgl_pengiriman, waktu_pengiriman, ongkir],
    );

    const pesanan_id = resultPesanan.rows[0].pesanan_id;
    let subtotal = 0;

    for (const item of items) {
      const { harga_menu_id, qty } = item;

      if (!Number.isInteger(qty) || qty <= 0) {
        throw createAppError('qty harus berupa angka bulat lebih dari 0');
      }

      if (!Number.isInteger(harga_menu_id) || harga_menu_id <= 0) {
        throw createAppError('harga_menu_id tidak valid');
      }

      const harga = await client.query(`SELECT harga_satuan FROM harga_menu WHERE harga_menu_id = $1`, [harga_menu_id]);

      if (harga.rows.length === 0) {
        throw createAppError('harga_menu tidak ditemukan', 404);
      }

      const harga_satuan = harga.rows[0].harga_satuan;

      await client.query(
        `INSERT INTO pesanan_menu
                (pesanan_id, harga_menu_id, qty, harga_satuan)
                VALUES ($1,$2,$3,$4)`,
        [pesanan_id, harga_menu_id, qty, harga_satuan],
      );

      subtotal += qty * harga_satuan;
    }

    const total_harga = subtotal + Number(ongkir || 0);

    await client.query(`UPDATE pesanan SET total_harga=$1 WHERE pesanan_id=$2`, [total_harga, pesanan_id]);

    await client.query('COMMIT');

    return { pesanan_id, total_harga };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ✅ UPDATE
const updatePesanan = async (id, data) => {
  const { nama, no_hp, alamat, metode_pembayaran, tgl_pengiriman, waktu_pengiriman, ongkir, items, status } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(`SELECT status FROM pesanan WHERE pesanan_id = $1 FOR UPDATE`, [id]);

    if (existing.rows.length === 0) {
      throw createAppError('Pesanan tidak ditemukan', 404);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw createAppError('items pesanan wajib diisi');
    }

    if (existing.rows[0].status === STATUS_BATAL) {
      throw createAppError('Pesanan batal tidak bisa diupdate', 409);
    }

    let subtotal = 0;
    const normalizedItems = [];

    for (const item of items) {
      const { harga_menu_id, qty } = item;

      if (!Number.isInteger(qty) || qty <= 0) {
        throw createAppError('qty harus berupa angka bulat lebih dari 0');
      }

      if (!Number.isInteger(harga_menu_id) || harga_menu_id <= 0) {
        throw createAppError('harga_menu_id tidak valid');
      }

      const harga = await client.query(`SELECT harga_satuan FROM harga_menu WHERE harga_menu_id=$1`, [harga_menu_id]);

      if (harga.rows.length === 0) {
        throw createAppError('harga_menu tidak ditemukan', 404);
      }

      const harga_satuan = harga.rows[0].harga_satuan;
      subtotal += qty * harga_satuan;
      normalizedItems.push({ harga_menu_id, qty, harga_satuan });
    }

    const nextStatus = Number.isInteger(status) ? status : existing.rows[0].status;
    const total_harga = subtotal + Number(ongkir || 0);

    await client.query(
      `UPDATE pesanan
            SET nama=$1, no_hp=$2, alamat=$3, metode_pembayaran=$4, tgl_pengiriman=$5, waktu_pengiriman=$6, ongkir=$7, status=$8, total_harga=$9
            WHERE pesanan_id=$10`,
      [nama, no_hp, alamat, metode_pembayaran, tgl_pengiriman, waktu_pengiriman, ongkir, nextStatus, total_harga, id],
    );

    await client.query(`DELETE FROM pesanan_menu WHERE pesanan_id=$1`, [id]);

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO pesanan_menu
                (pesanan_id, harga_menu_id, qty, harga_satuan)
                VALUES ($1,$2,$3,$4)`,
        [id, item.harga_menu_id, item.qty, item.harga_satuan],
      );
    }

    await client.query('COMMIT');

    return { pesanan_id: id, total_harga };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ✅ DELETE
const deletePesanan = async (id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query(`SELECT pesanan_id FROM pesanan WHERE pesanan_id=$1`, [id]);

    if (existing.rows.length === 0) {
      throw createAppError('Pesanan tidak ditemukan', 404);
    }

    await client.query(`UPDATE pesanan SET status=$1 WHERE pesanan_id=$2`, [STATUS_BATAL, id]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getListPesanan = async () => {
  const query = `
        SELECT 
            p.pesanan_id,
            p.nama,
            p.status,
            p.total_harga,
            p.ongkir,
            p.tgl_pengiriman,
            p.waktu_pengiriman,
            p.created_at,

            COUNT(pm.pesanan_menu_id) as total_item

        FROM pesanan p
        LEFT JOIN pesanan_menu pm ON pm.pesanan_id = p.pesanan_id
        WHERE p.status <> $1
        GROUP BY p.pesanan_id
        ORDER BY p.created_at DESC
    `;

  const result = await pool.query(query, [STATUS_BATAL]);
  return result.rows;
};

const getDetailPesanan = async (id) => {
  const query = `
        SELECT 
            p.*,
            pm.pesanan_menu_id,
            pm.qty,
            pm.harga_menu_id,
            pm.harga_satuan,
            m.nama_menu,
            k.nama_kategori
        FROM pesanan p
        LEFT JOIN pesanan_menu pm ON pm.pesanan_id = p.pesanan_id
        LEFT JOIN harga_menu hm ON hm.harga_menu_id = pm.harga_menu_id
        LEFT JOIN menu m ON m.menu_id = hm.menu_id
        LEFT JOIN kategori k ON k.kategori_id = hm.kategori_id
        WHERE p.pesanan_id = $1
    `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) return null;

  const pesanan = {
    pesanan_id: result.rows[0].pesanan_id,
    nama: result.rows[0].nama,
    no_hp: result.rows[0].no_hp,
    alamat: result.rows[0].alamat,
    status: result.rows[0].status,
    metode_pembayaran: result.rows[0].metode_pembayaran,
    tgl_pengiriman: result.rows[0].tgl_pengiriman,
    waktu_pengiriman: result.rows[0].waktu_pengiriman,
    total_harga: result.rows[0].total_harga,
    ongkir: result.rows[0].ongkir,
    created_at: result.rows[0].created_at,
    items: [],
  };

  for (const row of result.rows) {
    if (!row.pesanan_menu_id) {
      continue;
    }

    pesanan.items.push({
      pesanan_menu_id: row.pesanan_menu_id,
      nama_menu: row.nama_menu,
      harga_menu_id: row.harga_menu_id,
      kategori: row.nama_kategori,
      qty: row.qty,
      harga_satuan: row.harga_satuan,
      subtotal: row.qty * row.harga_satuan,
    });
  }

  return pesanan;
};

module.exports = {
  createPesanan,
  updatePesanan,
  deletePesanan,
  getListPesanan,
  getDetailPesanan,
};
