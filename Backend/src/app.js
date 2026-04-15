const express = require('express')
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler')
const pool = require('./config/db')

const menuRoutes = require('./routes/menuRoutes')
const pesananRoutes = require('./routes/pesananRoutes')

// const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// ✅ TEST SERVER
app.get('/', (req, res) => {
  res.send('Server jalan 🚀')
})

// ✅ TEST DB VIA API
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})


app.use('/api/menu', menuRoutes)
app.use('/api/pesanan', pesananRoutes)



// error middleware (harus paling bawah)
app.use(errorHandler)

module.exports = app