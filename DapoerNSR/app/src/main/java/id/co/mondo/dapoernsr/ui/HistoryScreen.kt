package id.co.mondo.dapoernsr.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import id.co.mondo.dapoernsr.data.model.HistoryOrder
import id.co.mondo.dapoernsr.ui.componen.DetailHistoryDialog
import id.co.mondo.dapoernsr.ui.theme.DapoerNSRTheme

@Composable
fun HistoryScreen(){

    var showDialog by remember { mutableStateOf(false) }
    var selectedOrder by remember { mutableStateOf<HistoryOrder?>(null) }



    val dummyData = listOf(
        HistoryOrder(
            id = 1,
            namaPembeli = "Andi",
            tanggalPesanan = "25 Februari 2026",
            jadwalPengiriman = "26 Februari 2026",
            waktuPengiriman = "10:00",
            nomorTelpon = "081234567890",
            alamat = "Jl. Barabaraya, Makassar",
            namaOrderan = "Songkolo",
            jumlahOrderan = 20,
            totalOrderan = 200000,
            hargaOngkir = 15000
        ),
        HistoryOrder(
            id = 2,
            namaPembeli = "Siti",
            tanggalPesanan = "24 Februari 2026",
            jadwalPengiriman = "25 Februari 2026",
            waktuPengiriman = "15:00",
            nomorTelpon = "089876543210",
            alamat = "Jl. Pettarani, Makassar",
            namaOrderan = "Cendil",
            jumlahOrderan = 15,
            totalOrderan = 150000,
            hargaOngkir = 12000
        ),
        HistoryOrder(
            id = 3,
            namaPembeli = "Siti",
            tanggalPesanan = "24 Februari 2026",
            jadwalPengiriman = "25 Februari 2026",
            waktuPengiriman = "15:00",
            nomorTelpon = "089876543210",
            alamat = "Jl. Pettarani, Makassar",
            namaOrderan = "Cendil",
            jumlahOrderan = 15,
            totalOrderan = 150000,
            hargaOngkir = 12000
        ),
        HistoryOrder(
            id = 4,
            namaPembeli = "Siti",
            tanggalPesanan = "24 Februari 2026",
            jadwalPengiriman = "25 Februari 2026",
            waktuPengiriman = "15:00",
            nomorTelpon = "089876543210",
            alamat = "Jl. Pettarani, Makassar",
            namaOrderan = "Cendil",
            jumlahOrderan = 15,
            totalOrderan = 150000,
            hargaOngkir = 12000
        )
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
//        items(dummyData) { order ->
//            HistoryCard(
//                namaPembeli = order.namaPembeli,
//                tanggalPesanan = order.tanggalPesanan,
//                jadwalPengiriman = order.jadwalPengiriman,
//                waktuPengiriman = order.waktuPengiriman,
//                totalOrderan = order.totalOrderan,
//                nomorTelpon = order.nomorTelpon,
//                alamat = order.alamat,
//                onClick = {
//                    selectedOrder = order
//                    showDialog = true
//                }
//            )
//        }
        item {
        Text("Data Belum ada")
        }
    }

    if (showDialog && selectedOrder != null) {
        androidx.compose.ui.window.Dialog(
            onDismissRequest = {
                showDialog = false
            }
        ) {
            DetailHistoryDialog(order = selectedOrder!!)
        }
    }

}

@Preview(showBackground = true)
@Composable
fun PreviewHistoryScreen() {
    DapoerNSRTheme {
        HistoryScreen()
    }
}
