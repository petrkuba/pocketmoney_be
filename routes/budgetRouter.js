const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId
const config = require('../config.js')


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

function getPlannedBalanceSum(balancesObject) {
    let sum = 0;
         for(const balance of balancesObject) {
             if(typeof balance.plannedBalance === 'number') {
                 sum += balance.plannedBalance;
             } else if (!isNaN(parseFloat(balance.plannedBalance))) {
                 sum += parseFloat(balance.plannedBalance);
             }
         }
    return sum;
}

function getRemainingBalanceSum(balancesObject) {
    let sum = 0;
        for(const balance of balancesObject) {
            if(typeof balance.currentBalance === 'number') {
                sum += balance.currentBalance;
            } else if (!isNaN(parseFloat(balance.currentBalance))) {
                sum += parseFloat(balance.currentBalance);
            }
        }
    return sum;
}

function getCumulativeRemainingBalanceAfterTax(remainingBalance, expenses) {

    let remainingTaxExpenses = 0;

    const taxExpenses = expenses.filter(expense => expense.expenseType === 'Tax');

      for(const expense of taxExpenses) {
          if(typeof expense.remainingAmount === 'number') {
              remainingTaxExpenses += expense.remainingAmount;
          } else if (!isNaN(parseFloat(expense.remainingAmount))) {
              remainingTaxExpenses += parseFloat(expense.remainingAmount);
          }
      }
    return remainingBalance - remainingTaxExpenses;
}

function getCumulativeRemainingBalanceAfterTaxMandatory(remainingBalance, expenses) {

    let remainingMandatoryExpenses = 0;
    let remainingBalanceAfterTax = getCumulativeRemainingBalanceAfterTax(remainingBalance, expenses);
    let remainingBalanceAfterTaxMandatory = 0

    const mandatoryExpenses = expenses.filter(expense => expense.expenseType === 'Mandatory');

      for(const expense of mandatoryExpenses) {
          if(typeof expense.remainingAmount === 'number') {
              remainingMandatoryExpenses += expense.remainingAmount;
          } else if (!isNaN(parseFloat(expense.remainingAmount))) {
              remainingMandatoryExpenses += parseFloat(expense.remainingAmount);
          }
      }

    remainingBalanceAfterTaxMandatory = remainingBalanceAfterTax - remainingMandatoryExpenses

    return remainingBalanceAfterTaxMandatory;
}

function getCumulativeRemainingBalanceAfterTaxMandatoryMust(remainingBalance, expenses) {

    let remainingMustExpenses = 0;
    let remainingBalanceAfterTaxMandatory = getCumulativeRemainingBalanceAfterTaxMandatory(remainingBalance, expenses);
    let remainingBalanceAfterTaxMandatoryMust = 0

    const mustExpenses = expenses.filter(expense => expense.expenseType === 'Must');

      for(const expense of mustExpenses) {
          if(typeof expense.remainingAmount === 'number') {
              remainingMustExpenses += expense.remainingAmount;
          } else if (!isNaN(parseFloat(expense.remainingAmount))) {
              remainingMustExpenses += parseFloat(expense.remainingAmount);
          }
      }

    remainingBalanceAfterTaxMandatoryMust = remainingBalanceAfterTaxMandatory - remainingMustExpenses

    return remainingBalanceAfterTaxMandatoryMust;
}

function getCumulativeRemainingBalanceAfterTaxMandatoryMustOthers(remainingBalance, expenses) {
    let remainingOtherExpenses = 0;
    let remainingBalanceAfterTaxMandatoryMust = getCumulativeRemainingBalanceAfterTaxMandatoryMust(remainingBalance, expenses);
    let remainingBalanceAfterTaxMandatoryMustOthers = 0

    const otherExpenses = expenses.filter(expense => expense.expenseType === 'Other');

      for(const expense of otherExpenses) {
          if(typeof expense.remainingAmount === 'number') {
              remainingOtherExpenses += expense.remainingAmount;
          } else if (!isNaN(parseFloat(expense.remainingAmount))) {
              remainingOtherExpenses += parseFloat(expense.remainingAmount);
          }
      }

    remainingBalanceAfterTaxMandatoryMustOther = remainingBalanceAfterTaxMandatoryMust - remainingOtherExpenses

    return remainingBalanceAfterTaxMandatoryMustOther;
}




//List
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

//Detail
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

                let remainingBalanceSum = 0;
                let modifiedResponse = {...results[0]};

                //adding balancesSums object
                if (results[0].balances) {
                    const plannedBalanceSum = getPlannedBalanceSum(results[0].balances);
                    remainingBalanceSum += getRemainingBalanceSum(results[0].balances);

                    modifiedResponse.balancesSums = {
                        "plannedBalanceSum": plannedBalanceSum,
                        "remainingBalanceSum": remainingBalanceSum
                    }
                }

                //adding cumulative remaining total balances
                if (results[0].expenses && modifiedResponse.balancesSums) {
                    const cumulativeRemainingTotalBalanceAfterTax = getCumulativeRemainingBalanceAfterTax(remainingBalanceSum, results[0].expenses);
                    const cumulativeRemainingTotalBalanceAfterTaxMandatory = getCumulativeRemainingBalanceAfterTaxMandatory(remainingBalanceSum, results[0].expenses);
                    const cumulativeRemainingTotalBalanceAfterTaxMandatoryMust = getCumulativeRemainingBalanceAfterTaxMandatoryMust(remainingBalanceSum, results[0].expenses);
                    const cumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers = getCumulativeRemainingBalanceAfterTaxMandatoryMustOthers(remainingBalanceSum, results[0].expenses);

                    modifiedResponse.balancesSums['remainingBalances'] = {
                            "afterTax": cumulativeRemainingTotalBalanceAfterTax,
                            "afterTaxMandatory": cumulativeRemainingTotalBalanceAfterTaxMandatory,
                            "afterTaxMandatoryMust": cumulativeRemainingTotalBalanceAfterTaxMandatoryMust,
                            "afterTaxMandatoryMustOthers": cumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers
                    }
                }

                //adding cumulative remaining balances for each account
                if (results[0].balances && results[0].expenses) {

                    results[0].balances.forEach((balance) => {

                         //vyfitlruj všechny expenses se patřící k danému účtu
                         const filteredExpenses = results[0].expenses.filter((expense) => expense.expenseAccount === balance.account || expense.expenseAccount === balance.balanceName);

                          const cumulativeRemainingBalanceAfterTax = getCumulativeRemainingBalanceAfterTax(balance.currentBalance, filteredExpenses);
                          const cumulativeRemainingBalanceAfterTaxMandatory = getCumulativeRemainingBalanceAfterTaxMandatory(balance.currentBalance, filteredExpenses);
                          const cumulativeRemainingBalanceAfterTaxMandatoryMust = getCumulativeRemainingBalanceAfterTaxMandatoryMust(balance.currentBalance, filteredExpenses);
                          const cumulativeRemainingBalanceAfterTaxMandatoryMustOthers = getCumulativeRemainingBalanceAfterTaxMandatoryMustOthers(balance.currentBalance, filteredExpenses);

                          balance.remainingBalanceAfterTax = cumulativeRemainingBalanceAfterTax;
                          balance.remainingBalanceAfterTaxMandatory = cumulativeRemainingBalanceAfterTaxMandatory;
                          balance.remainingBalanceAfterTaxMandatoryMust = cumulativeRemainingBalanceAfterTaxMandatoryMust;
                          balance.remainingBalanceAfterTaxMandatoryMustOthers = cumulativeRemainingBalanceAfterTaxMandatoryMustOthers;

                    });

               }

                res.json(modifiedResponse)

           })
           .catch(error => console.error(error))
})

//New
router.post('/new', validateNewBudgetRequestBody, (req, res) => {

    const db = getDB();

    const newBudget = {
      name: req.body.name
    };

    if(req.body.addMandatoryExpenses) {

      db.collection('mandatoryExpenses')
           .find({}, {projection:{_id:0, expenseName:1, expenseAmount:1, expenseAccount:1}})
           .toArray()
           .then(results => {
                if(results.length > 0) {
                    newBudget.expenses = results.map(item => ({
                         _id: new ObjectId(),
                          expenseName: item.expenseName,
                          remainingAmount: item.expenseAmount,
                          expenseAccount: item.expenseAccount,
                          expenseType: "Mandatory"
                    }));
                } else {
                    console.log("No items found in the database");
                }
                return db.collection('budgets').insertOne(newBudget);
           })
           .then(result => {
                const insertedId = result.insertedId;
                res.json({ insertedId });
           })
           .catch(error => {
                console.error('Error inserting budget', error);
                res.status(500).json({ error: 'An error occurred while inserting the budget' });
           });
    } else {
        db.collection('budgets')
            .insertOne(newBudget)
            .then(result => {
                const insertedId = result.insertedId;
                res.json({ insertedId });
            })
            .catch(error => {
                console.error('Error inserting budget', error);
                res.status(500).json({ error: 'An error occurred while inserting the budget' });
            });
    }
});

//Update
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

//Delete
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

module.exports = router;