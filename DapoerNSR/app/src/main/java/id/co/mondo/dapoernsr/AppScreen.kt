package id.co.mondo.dapoernsr

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import id.co.mondo.dapoernsr.ui.CreateOrderScreen
import id.co.mondo.dapoernsr.ui.HistoryScreen
import id.co.mondo.dapoernsr.ui.theme.DapoerNSRTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScreen(){
    val navController = rememberNavController()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route


    var currentTitle by remember { mutableStateOf("") }


    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = currentTitle,
                        fontSize = 16.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.navigateUp() }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Kembali"
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            if (currentRoute == "history") {
                FloatingActionButton(
                    onClick = {
                        navController.navigate("create-order")
                    },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = Color.Black
                ) {
                    Icon(Icons.Filled.Add, "Tambah Orderan Baru", tint = Color.White)
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "history",
            modifier = Modifier.padding(innerPadding)
        ){
            composable("history"){
                LaunchedEffect(Unit) {
                    currentTitle = "Riwayat Order"
                }
                HistoryScreen()
            }
            composable("create-order"){
                LaunchedEffect(Unit) {
                    currentTitle = "Tambah Pesanan Baru"
                }

                CreateOrderScreen()
            }
        }
    }

}


@Preview(showBackground = true)
@Composable
fun PreviewAppScreen(){
    DapoerNSRTheme {
        AppScreen()
    }
}