package id.co.mondo.dapoernsr.ui.componen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import id.co.mondo.dapoernsr.data.model.HistoryOrder
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DetailHistoryDialog(order: HistoryOrder) {

    val currencyFormat = NumberFormat.getCurrencyInstance(Locale("in", "ID"))

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = order.namaPembeli,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${order.tanggalPesanan}",
                    style = MaterialTheme.typography.bodySmall
                )

            }

            Divider()

            Text("Pengiriman: ${order.jadwalPengiriman}")
            Text("Nomor hp: ${order.nomorTelpon}")
            Text("Alamat: \n ${order.alamat}")

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Detail Order",
                fontWeight = FontWeight.SemiBold
            )

            Text("Nama Orderan: ${order.namaOrderan}")
            Text("Jumlah: ${order.jumlahOrderan}")
            Text("Ongkir: ${currencyFormat.format(order.hargaOngkir)}")
            Text("Total: ${currencyFormat.format(order.totalOrderan)}")

        }
    }
}