const pool = require('../config/db')

const getAvailableKategori = async (menu_id) => {
    const query = `
        SELECT
            hm.harga_menu_id,
            hm.menu_id,
            m.nama_menu,
            hm.kategori_id,
            k.nama_kategori,
            hm.harga_satuan
        FROM harga_menu hm
        JOIN kategori k ON hm.kategori_id = k.kategori_id
        JOIN menu m ON hm.menu_id = m.menu_id
        WHERE hm.menu_id = $1;
    `;
    const result = await pool.query(query, [menu_id]);
    return result.rows;
}



module.exports = { 
    getAvailableKategori
};