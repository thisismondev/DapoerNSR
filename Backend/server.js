require('dotenv').config()
const app = require('./src/app')
const pool = require('./src/config/db')

const PORT = process.env.PORT || 3000

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Gagal koneksi DB:', err.stack)
  }
  console.log('✅ Database connected!')
  release()
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})