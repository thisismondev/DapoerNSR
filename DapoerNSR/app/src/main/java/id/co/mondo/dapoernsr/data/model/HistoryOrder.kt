package id.co.mondo.dapoernsr.data.model

data class HistoryOrder(
    val id: Int,
    val namaPembeli: String,
    val tanggalPesanan: String,
    val jadwalPengiriman: String,
    val waktuPengiriman: String,
    val nomorTelpon: String,
    val alamat: String,
    val namaOrderan: String,
    val jumlahOrderan: Int,
    val hargaOngkir: Int,
    val totalOrderan: Int
)
