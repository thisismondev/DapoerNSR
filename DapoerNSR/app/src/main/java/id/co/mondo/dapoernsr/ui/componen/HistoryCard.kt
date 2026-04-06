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
import java.text.NumberFormat
import java.util.Locale

@Composable
fun HistoryCard(
    namaPembeli: String,
    tanggalPesanan: String,
    jadwalPengiriman: String,
    waktuPengiriman: String,
    nomorTelpon: String,
    alamat: String,
    totalOrderan: Int,
    onClick: () -> Unit
) {

    val currencyFormat = NumberFormat.getCurrencyInstance(Locale("in", "ID"))

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        onClick = onClick
    ) {

        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {

            // Nama
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = namaPembeli,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = tanggalPesanan,
                    style = MaterialTheme.typography.bodySmall
                )

            }

            Divider()

            // Informasi utama
            Text("Pengiriman: $jadwalPengiriman")
            Text("Waktu: $waktuPengiriman")
            Text("Nomor hp: $nomorTelpon")
            Text("Alamat \n $alamat")


            Spacer(modifier = Modifier.height(4.dp))

            // Total di bagian bawah rata kanan
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                Text(
                    text = currencyFormat.format(totalOrderan),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}