const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId




//------- BUDGET APIs ----------//

// Custom middleware function to control the request body in the adding new budget request
function validateNewBudgetRequestBody(req, res, next) {

  // If the request body is invalid, you can send an error response
  if (!req.body.name) {
    console.log("From server: \'Name\' field is missing in the request ");
    return res.status(400).send('From server: Missing mandatory field: \'name\'');
  }

  // If the request body is valid, you can modify it or perform additional operations
    //  req.body.timestamp = new Date(); // Add a timestamp to the request body

  // Call next() to proceed to the next middleware or route handler
  next();
}

// Custom middleware function to control the request body in the updating budget request
function validateUpdatedBudgetRequestBody(req, res, next) {

  // Check if the request body contains name
  if (!req.body.name) {
    console.log("From server: \'Name\' field is missing in the request ");
    return res.status(400).send('From server: Missing mandatory field: \'name\'');
  }

  // Call next() to proceed to the next middleware or route handler
  next();
}


// GET list of budgets
router.get('/list', (req,res) => {
       const db = getDB();
       db.collection('budgets')
           .find({}, {projection: {_id:1, name:1}})
           .toArray()
           .then(results => {
               res.json(results)
           })
           .catch(error => console.error(error))
})

// GET budget detail
router.get ('/:id', (req, res) => {
       const db = getDB();
       //id z url se musí převést na ObjectId, aby se podle něj dalo vyhledávat
       let budget_id = new ObjectId(req.params.id)
       db.collection('budgets')
           .find({_id:budget_id})
           .toArray()
           .then(results => {
                if (results[0] === undefined) {
                    res.send("From server: No budget found")
                }
               res.json(results[0])
           })
           .catch(error => console.error(error))
})

//POST create new budget
router.post('/new', validateNewBudgetRequestBody, (req, res) => {
    const newBudget = req.body;
    const db = getDB();
    db.collection('budgets')
        .insertOne(newBudget)
        .then(result => {
            const insertedId = result.insertedId;
            res.json({ insertedId });
        })
        .catch(error => console.error('Error inserting budget', error));
})

//PUT update budget
router.put('/update/:id', validateUpdatedBudgetRequestBody, (req, res) => {
    const { id } = req.params;
    const updatedName = req.body.name;
    const db = getDB();
    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(id) },
            { $set: {name: updatedName} }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.send("From server: Budget updated");
            } else {
                res.send("From server: No budget found or no changes sent for the given ID");
            }
        })
        .catch(error => console.error('From server: Error updating budget:', error));
});

//DELETE budget
router.delete('/delete/:id', (req, res) => {
  const budgetId = req.params.id;
  const db = getDB();

  db.collection('budgets')
    .deleteOne({ _id: new ObjectId(budgetId) })
    .then(() => {
      res.json({ message: 'From server: Budget deleted' });
    })
    .catch(error => {
      console.error('From server: Error deleting budget', error);
      res.status(500).json({ error: 'From server: Error deleting budget' });
    });
});

//------- BALANCE APIs ----------//

function validateAddBalanceRequestBody(req, res, next) {

    //check if the request body contains name
    if(!req.body.balanceName) {
        console.log("From server: Invalid add balance request. \'balanceName\' field is missing in the request ");
        return res.status(400).send('Missing mandatory field: \'balanceName\'');
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

//PUT add new balance
router.put('/balance/add/:budgetid', validateAddBalanceRequestBody, (req, res) => {

        // Create new ObjectId for the balance item
        const newBalanceId = new ObjectId();

        const db = getDB();
        db.collection('budgets')
            .updateOne(
                { _id: new ObjectId(req.params.budgetid)},
                { $addToSet: {balances:
                    {
                        _id: newBalanceId, // Add the generated ObjectId to the new balance item
                        balanceName: req.body.balanceName,
                        currentBalance: req.body.currentBalance,
                        plannedBalance: req.body.plannedBalance
                    }
                  }
                }
            )
            .then(result => {
                if (result.modifiedCount === 1) {
                    const insertedBalanceName = req.body.balanceName;
                    res.json({insertedBalanceName});
                } else {
                    res.send("From server: No budget found or no changes sent for the given ID");
                }
            })
            .catch(error => console.error('From server: Error updating budget:', error));
});

//PUT update balance
router.put('/balance/update/:budgetid', validateDeleteUpdateBalanceRequestBody, (req, res) => {
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
router.put('/balance/delete/:budgetid', validateDeleteUpdateBalanceRequestBody, (req, res) => {
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

//---------- EXPENSES APIs ---------//

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
router.put('/expense/add/:budgetid', validateAddExpenseRequestBody, (req, res) => {

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
                'balances.balanceName': expenseAccount
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
router.put('/expense/update/:budgetid', validateDeleteUpdateExpenseRequestBody, (req, res) => {
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
router.put('/expense/delete/:budgetid', validateDeleteUpdateExpenseRequestBody, (req, res) => {

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