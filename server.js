const express = require('express')
const cors = require('cors')
const app = express()
const budgetRouter = require ('./routes/budget/budgetRouter')
const mockRouter = require ('./routes/mockRouter')
const mandatoryExpensesRouter = require ('./routes/config/mandatoryExpensesRouter')
const expenseTypesRouter = require ('./routes/config/expenseTypesRouter')
const balanceRouter = require('./routes/budget/balanceRouter')
const expenseRouter = require('./routes/budget/expenseRouter')
const accountsRouter = require('./routes/account/accountRouter')
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
app.use('/config/mandatoryExpenses', mandatoryExpensesRouter)
app.use('/config/expenseTypes', expenseTypesRouter)
app.use('/accounts', accountsRouter)

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



