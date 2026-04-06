package id.co.mondo.dapoernsr.ui.helper

fun convertMillisToDate(millis: Long): String {
    val formatter = java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault())
    return formatter.format(java.util.Date(millis))
}