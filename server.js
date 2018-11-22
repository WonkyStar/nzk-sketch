const express = require('express')
const app = express()
const port = 8888

app.use(express.static('./'))

app.listen(port, () => console.log(`Served at ${port}!`))