const express = require("express");
const router = express.Router();
const {
    createPesanan,
    updatePesanan,
    deletePesanan,
    getListPesanan,
    getDetailPesanan
} = require("../controllers/pesananController");

router.get("/", getListPesanan);
router.get("/:id", getDetailPesanan);
router.post("/", createPesanan);
router.put("/:id", updatePesanan);
router.delete("/:id", deletePesanan);

module.exports = router;