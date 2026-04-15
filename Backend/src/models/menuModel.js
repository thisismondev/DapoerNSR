const pool = require('../config/db')

const getAvailableMenus = async () => {
    const query = `
        SELECT
            menu_id,
            nama_menu,
            image_url
        FROM menu
        ORDER BY menu_id DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}





module.exports = { 
    getAvailableMenus
};