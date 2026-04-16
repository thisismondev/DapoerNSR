const express = require('express')
const router = express.Router()

const { 
    getMenus
} = require('../controllers/pesananController')


router.get('/', getMenus)

module.exports = router