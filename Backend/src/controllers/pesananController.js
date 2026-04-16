const MenuModel = require('../models/menuModel')
const PesananModel = require('../models/pesananModel')

const getMenus = async (req, res) => {
    try {
        const data = await MenuModel.fetchMenus();

        res.status(200).json({
            success: true,
            message: "Berhasil ambil data menu",
            data: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createPesanan = async (req, res) => {
    try {
        const result = await PesananModel.createPesanan(req.body);

        res.status(201).json({
            success: true,
            message: "Pesanan berhasil dibuat",
            data: result
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



// ✅ UPDATE
const updatePesanan = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const result = await PesananModel.updatePesanan(id, req.body);

        res.json({
            success: true,
            message: "Pesanan berhasil diupdate",
            data: result
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};



// ✅ DELETE
const deletePesanan = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        await PesananModel.deletePesanan(id);

        res.json({
            success: true,
            message: "Pesanan berhasil dihapus"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getDetailPesanan = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const data = await PesananModel.getDetailPesanan(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Pesanan tidak ditemukan"
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getListPesanan = async (req, res) => {
    try {
        const data = await PesananModel.getListPesanan();

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


module.exports = {
  getMenus,
  createPesanan,
  updatePesanan,
  deletePesanan,
  getListPesanan,
  getDetailPesanan
}