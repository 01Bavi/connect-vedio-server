const express = require('express')
const app = express()

// routes

app.get('/', (req, res) => {
    res.send('Hello NODE API')
})
app.listen(3000, () => {
    console.log(`node API running`)
})