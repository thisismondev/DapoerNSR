const express = require('express')
const router = express.Router()

const { 
    getMenus, 
    getKategori
} = require('../controllers/pesananController')


router.get('/', getMenus)
router.get('/:menu_id/kategori', getKategori)

module.exports = router