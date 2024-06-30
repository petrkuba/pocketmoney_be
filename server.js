const express = require('express')
const cors = require('cors')
const app = express()
const budgetRouter = require ('./routes/budgetRouter')
const mockRouter = require ('./routes/mockRouter')
const configRouter = require ('./routes/configRouter')
const balanceRouter = require('./routes/balanceRouter')
const expenseRouter = require('./routes/expenseRouter')
const mongoConnect = require ('./db').mongoConnect
const swaggerUI = require('swagger-ui-express');
const {swaggerSpec} = require('./swagger');

app.use(cors());
app.use(express.json());

//Swagger route
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//API routes
app.use('/budget', budgetRouter)
app.use('/budget/balance', balanceRouter)
app.use('/budget/expense', expenseRouter)
app.use('/mock', mockRouter)
app.use('/config', configRouter)

//Root route - must be at the end
app.use('/', (req, res) =>
    res.send('Welcome to PocketMoney application')
)

mongoConnect(() => {
    app.listen(3001, () => {
        console.log('Server is listening on port 3001')
    })
})

module.exports = app;



