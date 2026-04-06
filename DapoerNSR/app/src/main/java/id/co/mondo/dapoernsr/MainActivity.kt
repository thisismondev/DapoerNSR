package id.co.mondo.dapoernsr

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import id.co.mondo.dapoernsr.ui.theme.DapoerNSRTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DapoerNSRTheme {
                AppScreen()
            }
        }
    }
}