const pool = require("../config/db");

// ✅ CREATE
const createPesanan = async (data) => {
    const { nama, no_hp, alamat, metode_pembayaran, pengiriman, ongkir, items } = data;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const resultPesanan = await client.query(
            `INSERT INTO pesanan 
            (nama, no_hp, alamat, status, metode_pembayaran, pengiriman, total_harga, ongkir)
            VALUES ($1,$2,$3,1,$4,$5,0,$6)
            RETURNING pesanan_id`,
            [nama, no_hp, alamat, metode_pembayaran, pengiriman, ongkir]
        );

        const pesanan_id = resultPesanan.rows[0].pesanan_id;
        let total = 0;

        for (const item of items) {
            const { harga_menu_id, qty } = item;

            const harga = await client.query(
                `SELECT harga_satuan FROM harga_menu WHERE harga_menu_id = $1`,
                [harga_menu_id]
            );

            if (harga.rows.length === 0) {
                throw new Error("harga_menu tidak ditemukan");
            }

            const harga_satuan = harga.rows[0].harga_satuan;

            await client.query(
                `INSERT INTO pesanan_menu
                (pesanan_id, harga_menu_id, qty, harga_satuan)
                VALUES ($1,$2,$3,$4)`,
                [pesanan_id, harga_menu_id, qty, harga_satuan]
            );

            total += qty * harga_satuan;
        }

        await client.query(
            `UPDATE pesanan SET total_harga=$1 WHERE pesanan_id=$2`,
            [total, pesanan_id]
        );

        await client.query("COMMIT");

        return { pesanan_id, total };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};



// ✅ UPDATE
const updatePesanan = async (id, data) => {
    const { nama, no_hp, alamat, metode_pembayaran, pengiriman, ongkir, items } = data;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `UPDATE pesanan
            SET nama=$1, no_hp=$2, alamat=$3, metode_pembayaran=$4, pengiriman=$5, ongkir=$6
            WHERE pesanan_id=$7`,
            [nama, no_hp, alamat, metode_pembayaran, pengiriman, ongkir, id]
        );

        await client.query(
            `DELETE FROM pesanan_menu WHERE pesanan_id=$1`,
            [id]
        );

        let total = 0;

        for (const item of items) {
            const { harga_menu_id, qty } = item;

            const harga = await client.query(
                `SELECT harga_satuan FROM harga_menu WHERE harga_menu_id=$1`,
                [harga_menu_id]
            );

            const harga_satuan = harga.rows[0].harga_satuan;

            await client.query(
                `INSERT INTO pesanan_menu
                (pesanan_id, harga_menu_id, qty, harga_satuan)
                VALUES ($1,$2,$3,$4)`,
                [id, harga_menu_id, qty, harga_satuan]
            );

            total += qty * harga_satuan;
        }

        await client.query(
            `UPDATE pesanan SET total_harga=$1 WHERE pesanan_id=$2`,
            [total, id]
        );

        await client.query("COMMIT");

        return { pesanan_id: id, total };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};



// ✅ DELETE
const deletePesanan = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `DELETE FROM pesanan_menu WHERE pesanan_id=$1`,
            [id]
        );

        await client.query(
            `DELETE FROM pesanan WHERE pesanan_id=$1`,
            [id]
        );

        await client.query("COMMIT");

    } catch (err) {
        await client.query("ROLLBACK");
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
            p.created_at,

            COUNT(pm.pesanan_menu_id) as total_item

        FROM pesanan p
        JOIN pesanan_menu pm ON pm.pesanan_id = p.pesanan_id
        GROUP BY p.pesanan_id
        ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query);
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
        JOIN pesanan_menu pm ON pm.pesanan_id = p.pesanan_id
        JOIN harga_menu hm ON hm.harga_menu_id = pm.harga_menu_id
        JOIN menu m ON m.menu_id = hm.menu_id
        JOIN kategori k ON k.kategori_id = hm.kategori_id
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
        pengiriman: result.rows[0].pengiriman,
        total_harga: result.rows[0].total_harga,
        ongkir: result.rows[0].ongkir,
        created_at: result.rows[0].created_at,
        items: []
    };

    for (const row of result.rows) {
        pesanan.items.push({
            pesanan_menu_id: row.pesanan_menu_id,
            nama_menu: row.nama_menu,
            harga_menu_id: row.harga_menu_id,
            kategori: row.nama_kategori,
            qty: row.qty,
            harga_satuan: row.harga_satuan,
            subtotal: row.qty * row.harga_satuan
        });
    }

    return pesanan;
};

module.exports = {
    createPesanan,
    updatePesanan,
    deletePesanan,
    getListPesanan,
    getDetailPesanan
};