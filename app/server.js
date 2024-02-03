const express = require('express')
const cors = require('cors')
const app = express()
const budgetRouter = require ('./routes/budgetRouter')
const mockRouter = require ('./routes/mockRouter')
const configRouter = require ('./routes/configRouter')
const mongoConnect = require ('./db').mongoConnect

app.use(cors());
app.use(express.json());

//routes
app.use('/budget', budgetRouter)
app.use('/mock', mockRouter)
app.use('/config', configRouter)
app.use('/', (req, res) =>
    res.send('Welcome to PocketMoney application')
)

mongoConnect(() => {
    app.listen(3001, () => {
        console.log('Server is listening on port 3001')
    })
})

module.exports = app;



