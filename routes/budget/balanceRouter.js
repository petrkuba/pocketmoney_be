const express = require('express');
const router = express.Router();
const getDB = require ('../../db').getDB
const ObjectId = require('../../db').ObjectId

function validateAddBalanceRequestBody(req, res, next) {

    //check if the request body contains name
    if(!req.body.account) {
        console.log("From server: Invalid add balance request. \'account\' field is missing in the request ");
        return res.status(400).send('Missing mandatory field: \'account\'');
    }
    //TODO check if the balance name is unique
    next();
}

function validateDeleteUpdateBalanceRequestBody(req, res, next) {

    //check if the request body contains balance id
    if(!req.body.balanceId) {
        console.log("From server: Invalid delete balance request. \'balanceId\' field is missing in the request");
        return res.status(400).send('Missing mandatory field: \'balanceId\'')
    }
    next();
}

function updateBudgetBalances (budgetid) {

}

//PUT add new balance
router.put('/add/:budgetid', validateAddBalanceRequestBody, (req, res) => {

    // Create new ObjectId for the balance item
    const newBalanceId = new ObjectId();

    const db = getDB();
    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(req.params.budgetid)},
            { $addToSet: {balances:
                        {
                            _id: newBalanceId, // Add the generated ObjectId to the new balance item
                            account: req.body.account,
                            currentBalance: req.body.currentBalance,
                            plannedBalance: req.body.plannedBalance
                        }
                }
            }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                const insertedAccount = req.body.account;
                res.json({insertedAccount});
            } else {
                res.send("From server: No budget found or no changes sent for the given ID");
            }
        })
        .catch(error => console.error('From server: Error updating budget:', error));
});

//PUT update balance
router.put('/update/:budgetid', validateDeleteUpdateBalanceRequestBody, (req, res) => {
    const db = getDB();

    const budgetId = req.params.budgetid;
    //mapping received fields to be updated to variables
    const { balanceId, balanceName, currentBalance, plannedBalance } = req.body;

    //check budgetId format
    if(!ObjectId.isValid(budgetId)) {
        return res.status(400).json({ error: 'Invalid budgetId format' });
    }

    //check balanceID format
    if(!ObjectId.isValid(balanceId)) {
        return res.status(400).json({ error: 'Invalid balanceId format' });
    }

    //add values from input to object with fields to be updated
    const updatedFields = {};
    //  updatedFields[balanceId]
    if (balanceName) {
        updatedFields['balances.$.balanceName'] = balanceName;
        //the $ in the field path represents the position of the matched element in the balances array
    }
    if (currentBalance) {
        updatedFields['balances.$.currentBalance'] = currentBalance;
    }
    if (plannedBalance) {
        updatedFields['balances.$.plannedBalance'] = plannedBalance;
    }

    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetId), 'balances._id': new ObjectId(balanceId) },
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
router.put('/delete/:budgetid', validateDeleteUpdateBalanceRequestBody, (req, res) => {
    const db = getDB();

    const budgetId = req.params.budgetid;
    const balanceIdToDelete = req.body.balanceId;

    if(!ObjectId.isValid(budgetId)) {
        return res.status(400).json({ error: 'Invalid budgetId' });
    }

    if(!ObjectId.isValid(balanceIdToDelete)) {
        return res.status(400).json({ error: 'Invalid balanceId' });
    }

    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetId) },
            { $pull: {balances:
                        { _id: new ObjectId(balanceIdToDelete)}
                }
            }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.json({balanceIdToDelete});
            } else {
                res.send("From server: No budget found or no changes sent for the given ID");
            }
        })
        .catch(error => {
            console.error('From server: Error deleting balance:', error);
            res.status(500).json({ error: 'An error occurred while deleting the balance' });
        });

});

module.exports = router;