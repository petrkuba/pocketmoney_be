const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId

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

//PUT add new expense
router.put('/add/:budgetid', validateAddExpenseRequestBody, (req, res) => {

    // Create new ObjectId for the balance item
    const newExpenseId = new ObjectId();
    const expenseAccount = req.body.expenseAccount;
    const expenseType = req.body.expenseType;

    const newExpense = {
        _id: newExpenseId, // Add the generated Expense Id to the new expense record
        expenseName: req.body.expenseName,
        expenseType: req.body.expenseType,
        plannedAmount: req.body.remainingAmount,
        paidAmount: req.body.paidAmount,
        remainingAmount: req.body.remainingAmount,
        expenseAccount: req.body.expenseAccount
    };

    const db = getDB();

    const dynamicFieldName = `balances.$.remainingBalanceAfterExpenses.${req.body.expenseType}`;

    Promise.all([
        //update expense
        db.collection('budgets').updateOne(
            { _id: new ObjectId(req.params.budgetid)},
            { $addToSet: { expenses: newExpense } }
        ),

        db.collection('budgets').updateOne(
            {
                _id: new ObjectId(req.params.budgetid),
                $or: [
                    {'balances.balanceName' : expenseAccount},
                    {'balances.account' : expenseAccount}
                ]
            },
            {
                $inc: {
                    // 'balances.$.remainingBalance': -parseFloat(req.body.remainingAmount || 0)
                    [dynamicFieldName]: -parseFloat(req.body.remainingAmount || 0)
                }
            }
        )
    ])
        .then(results => {
            const expenseResult = results[0];
            const balanceResult = results[1];

            if (expenseResult.modifiedCount === 1 && balanceResult.modifiedCount === 1) {
                const insertedExpenseName = req.body.expenseName;
                res.json({insertedExpenseName});
                console.log(insertedExpenseName);
            } else {
                res.status(400).json({ error:"From server: No budget found or no changes sent for the given ID" });
            }
        })
        .catch(error => {
            console.error('From server: Error updating budget:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

//PUT update balance
router.put('/update/:budgetid', validateDeleteUpdateExpenseRequestBody, (req, res) => {
    const db = getDB();

    const budgetId = req.params.budgetid;
    //mapping received fields to be updated to variables
    const { expenseId, expenseName, expenseType, plannedAmount, paidAmount, remainingAmount, expenseAccount } = req.body;

    //check budgetId format
    if(!ObjectId.isValid(budgetId)) {
        return res.status(400).json({ error: 'Invalid budgetId format' });
    }

    //check expense ID format
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

//PUT delete balance
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

module.exports = router;