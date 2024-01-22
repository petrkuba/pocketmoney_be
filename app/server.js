const express = require('express')
const cors = require('cors')
const app = express()
const budgetRouter = require ('./routes/budgetRouter')
const balanceRouter = require ('./routes/balanceRouter')
const mongoConnect = require ('./db').mongoConnect

app.use(cors());
app.use(express.json());

//routes
app.use('/budget', budgetRouter)
//app.use('/budget/balance', balanceRouter)
app.use('/', (req, res) =>
    res.send('Welcome to PocketMoney application')
)

mongoConnect(() => {
    app.listen(3001, () => {
        console.log('Server is listening on port 3001')
    })
})

module.exports = app;



