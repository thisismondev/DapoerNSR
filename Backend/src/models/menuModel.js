const pool = require('../config/db')

const fetchMenus = async () => {
    const query = `
        SELECT
            hm.harga_menu_id,
            m.menu_id,
            m.nama_menu,
            m.image_url,
            k.kategori_id,
            k.nama_kategori,
            hm.harga_satuan
        FROM harga_menu hm
        JOIN menu m ON hm.menu_id = m.menu_id
        JOIN kategori k ON hm.kategori_id = k.kategori_id
        ORDER BY hm.harga_menu_id DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

module.exports = { 
    fetchMenus
};