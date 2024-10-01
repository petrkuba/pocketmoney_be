const express = require('express');
const router = express.Router();
const getDB = require ('../../db').getDB
const ObjectId = require('../../db').ObjectId

function validateAddExpenseRequestBody(req, res, next) {

    //check whether the expense name is filled
    if(!req.body.expenseName) {
        console.log("From server: Invalid request. \'expenseName\' field is missing");
        return res.status(400).send("Missing mandatory field: \'expenseName\'");
    }
    if (!req.body.remainingAmount) {
        console.log("From server: Invalid request. \'remainingAmount\' field is missing");
        return res.status(400).send("Missing mandatory field: \'remainingAmount\'");
    }
    next();
};

function validateDeleteUpdateExpenseRequestBody(req, res, next) {

    //check whether the expense id is filled
    if(!req.body.expenseId) {
        console.log("From server: Invalid request. \'expenseId\' field is missing");
        return res.status(400).send("Missing mandatory field: \'expenseId\'");
    }
    next();
};

//New
router.put('/add/:budgetid', validateAddExpenseRequestBody, (req, res) => {

    const newExpenseId = new ObjectId(); //new ObjectId for the expense item
    const expenseAccount = req.body.expenseAccount;
    const expenseType = req.body.expenseType;

    //new object to be saved
    const newExpense = {
        _id: newExpenseId, // Add the generated Expense Id to the new expense record
        expenseName: req.body.expenseName,
        expenseType: req.body.expenseType,
        plannedAmount: req.body.remainingAmount,
        remainingAmount: req.body.remainingAmount,
        paidAmount: req.body.paidAmount,
        expenseAccount: req.body.expenseAccount
    };

    const db = getDB();

    Promise.all([
        //update expense
        db.collection('budgets').updateOne(
            { _id: new ObjectId(req.params.budgetid)},
            { $addToSet: { expenses: newExpense } }
        ),

    ])
        .then(results => {
            const expenseResult = results[0];
              if (expenseResult.modifiedCount === 1) {
                const insertedExpenseName = req.body.expenseName;
                res.json({insertedExpenseName});
            } else {
                res.status(400).json({ error:"From server: No budget found or no changes sent for the given ID" });
            }
        })
        .catch(error => {
            console.error('From server: Error updating budget:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

//Update
router.put('/update/:budgetid', validateDeleteUpdateExpenseRequestBody, (req, res) => {
    const db = getDB();

    const budgetId = req.params.budgetid;
    //mapping received fields to be updated to variables
    const { expenseId, expenseName, expenseType, plannedAmount, paidAmount, remainingAmount, expenseAccount } = req.body;

    //validate budgetId format
    if(!ObjectId.isValid(budgetId)) {
        return res.status(400).json({ error: 'Invalid budgetId format' });
    }

    //validate expense ID format
    if(!ObjectId.isValid(expenseId)) {
        return res.status(400).json({ error: 'Invalid expenseId format' });
    }

    //add values from request body to object with fields to be updated
    const updatedFields = {};
    //  updatedFields[balanceId]
    if (expenseName) {
        updatedFields['expenses.$.expenseName'] = expenseName;
        //the $ in the field path represents the position of the matched element in the balances array
    }
    if (expenseType) {
        updatedFields['expenses.$.expenseType'] = expenseType;
    }
    if (plannedAmount) {
        updatedFields['expenses.$.plannedAmount'] = plannedAmount;
    }
    if (paidAmount) {
        updatedFields['expenses.$.paidAmount'] = paidAmount;
    }
    if (remainingAmount) {
        updatedFields['expenses.$.remainingAmount'] = remainingAmount;
    }
    if (expenseAccount) {
        updatedFields['expenses.$.expenseAccount'] = expenseAccount;
    }

    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetId), 'expenses._id': new ObjectId(expenseId) },
            { $set: updatedFields }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.status(200).json(updatedFields);
            } else {
                res.status(500).json( { error: "From server: No budget found or no changes sent for the given ID"} );
            }
        })
        .catch(error => console.error('From server: Error updating balance:', error));
});

//Delete
router.put('/delete/:budgetid', validateDeleteUpdateExpenseRequestBody, (req, res) => {

    //save received expense and budget IDs into variables
    const budgetIdToUpdate = req.params.budgetid;
    const expenseIdToDelete = req.body.expenseId;

    //check if the received IDs are valid ID objects
    if(!ObjectId.isValid(budgetIdToUpdate)) {
        return res.status(400).json({ error: 'Invalid budgetId' });
    }

    if(!ObjectId.isValid(expenseIdToDelete)) {
        return res.status(400).json({ error: 'Invalid expenseId' });
    }

    //delete the expense from DB
    const db = getDB();
    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetIdToUpdate) },
            { $pull: {expenses:
                        { _id: new ObjectId(expenseIdToDelete)}
                }
            }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.json({expenseIdToDelete});
            } else {
                res.send("From server: No budget found or no changes sent for the given ID");
            }
        })
        .catch(error => {
            console.error('From server: Error deleting expense:', error);
            res.status(500).json({ error: 'An error occurred while deleting the expense' });
        });
});

router.put('/pay/:expenseId', (req, res) => {
    const db = getDB();
    const expenseId = req.params.expenseId;

    //Retrieve the budget from the database
    db.collection('budgets')
        .findOne({ 'expenses._id': new ObjectId(expenseId) })
        .then(budget => {
            if (!budget) {
                return res.status(404).json({ error: 'Budget not found' });
            }
            //get the remainingAmount and expenseAccount of the expense
            const expenseIndex = budget.expenses.findIndex(expense => expense._id.toString() === expenseId);
            const expenseRemainingAmount = budget.expenses[expenseIndex].remainingAmount;
            const expenseAccount = budget.expenses[expenseIndex].expenseAccount;

            //Update remainingAmount and paidAmount of the expense
            budget.expenses[expenseIndex].remainingAmount = 0;
            budget.expenses[expenseIndex].paidAmount = expenseRemainingAmount;

            //Update the account balance
            const balanceIndex = budget.balances.findIndex(balance =>
                balance.account === budget.expenses[expenseIndex].expenseAccount
                ||
                balance.balanceName === budget.expenses[expenseIndex].expenseAccount
                );
            budget.balances[balanceIndex].currentBalance = budget.balances[balanceIndex].currentBalance - expenseRemainingAmount;

            //Update the budget in the database
           db.collection('budgets')
                .updateOne(
                    { _id: budget._id },
                    { $set: { expenses: budget.expenses, balances: budget.balances } }
                )
                .then(result => {
                    if (result.modifiedCount === 1) {
                        res.json({expenseId});
                    } else {
                        res.status(500).json({ error: 'An error occurred while updating the budget' });
                    }
                })
                .catch(error => {
                    console.error('Error updating budget:', error);
                    res.status(500).json({ error: 'An error occurred while updating the budget' });
                });

        })
    }
);

module.exports = router;