const MenuModel = require('../models/menuModel');
const PesananModel = require('../models/pesananModel');

const STATUS_BELUM = 1;
const STATUS_SELESAI = 2;
const STATUS_BATAL = 3;

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const getHttpStatus = (err) => err.statusCode || err.status || 500;

const validatePesananBody = (body, { allowStatus = false } = {}) => {
  const { nama, no_hp, alamat, metode_pembayaran, pengiriman, ongkir, items, status } = body;
  const parsedOngkir = ongkir === undefined ? 0 : Number(ongkir);
  const parsedStatus = status === undefined ? undefined : Number(status);

  if (!nama || !no_hp || !alamat || !metode_pembayaran || !pengiriman) {
    const error = new Error('Field pesanan wajib lengkap');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('items pesanan wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(parsedOngkir) || parsedOngkir < 0) {
    const error = new Error('ongkir harus berupa angka bulat 0 atau lebih');
    error.statusCode = 400;
    throw error;
  }

  if (allowStatus && parsedStatus !== undefined && ![STATUS_BELUM, STATUS_SELESAI, STATUS_BATAL].includes(parsedStatus)) {
    const error = new Error('status pesanan tidak valid');
    error.statusCode = 400;
    throw error;
  }

  const normalizedItems = items.map((item, index) => {
    const hargaMenuId = Number(item?.harga_menu_id);
    const qty = Number(item?.qty);

    if (!Number.isInteger(hargaMenuId) || hargaMenuId <= 0) {
      const error = new Error(`items[${index}].harga_menu_id tidak valid`);
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      const error = new Error(`items[${index}].qty harus lebih dari 0`);
      error.statusCode = 400;
      throw error;
    }

    return {
      harga_menu_id: hargaMenuId,
      qty,
    };
  });

  return {
    nama,
    no_hp,
    alamat,
    metode_pembayaran,
    pengiriman,
    ongkir: parsedOngkir,
    items: normalizedItems,
    ...(allowStatus && parsedStatus !== undefined ? { status: parsedStatus } : {}),
  };
};

const getMenus = async (req, res) => {
  try {
    const data = await MenuModel.fetchMenus();

    res.status(200).json({
      success: true,
      message: 'Berhasil ambil data menu',
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createPesanan = async (req, res) => {
  try {
    const payload = validatePesananBody(req.body);
    const result = await PesananModel.createPesanan(payload);

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: result,
    });
  } catch (err) {
    res.status(getHttpStatus(err)).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ UPDATE
const updatePesanan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID pesanan tidak valid',
      });
    }

    const payload = validatePesananBody(req.body, { allowStatus: true });
    const result = await PesananModel.updatePesanan(id, payload);

    res.status(200).json({
      success: true,
      message: 'Pesanan berhasil diupdate',
      data: result,
    });
  } catch (err) {
    res.status(getHttpStatus(err)).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ DELETE
const deletePesanan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID pesanan tidak valid',
      });
    }

    await PesananModel.deletePesanan(id);

    res.status(200).json({
      success: true,
      message: 'Pesanan berhasil dibatalkan',
    });
  } catch (err) {
    res.status(getHttpStatus(err)).json({
      success: false,
      message: err.message,
    });
  }
};

const getDetailPesanan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID pesanan tidak valid',
      });
    }

    const data = await PesananModel.getDetailPesanan(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(getHttpStatus(err)).json({
      success: false,
      message: err.message,
    });
  }
};

const getListPesanan = async (req, res) => {
  try {
    const data = await PesananModel.getListPesanan();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(getHttpStatus(err)).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getMenus,
  createPesanan,
  updatePesanan,
  deletePesanan,
  getListPesanan,
  getDetailPesanan,
};
