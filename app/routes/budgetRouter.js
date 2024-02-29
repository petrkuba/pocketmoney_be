const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId


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

function getCumulativeRemainingTotalBalanceAfterTax() {
    let sum = 9999;
    return sum;
}

function getCumulativeRemainingTotalBalanceAfterTaxMandatory() {
    let sum = 8888;
    return sum;
}

function getCumulativeRemainingTotalBalanceAfterTaxMandatoryMust() {
    let sum = 7777;
    return sum;
}

function getCumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers() {
    let sum = 6666;
    return sum;
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

                let modifiedResponse = {...results[0]};

                //adding balancesSums object to the response JSON
                if (results[0].balances) {
                    const plannedBalanceSum = getPlannedBalanceSum(results[0].balances);
                    const remainingBalanceSum = getRemainingBalanceSum(results[0].balances);


                    modifiedResponse.balancesSums = {
                        "plannedBalanceSum": plannedBalanceSum,
                        "remainingBalanceSum": remainingBalanceSum
                    }
                }

                //adding cumulative remaining balances after particular expense types
                if (results[0].expenses) {
                    const cumulativeRemainingTotalBalanceAfterTax = getCumulativeRemainingTotalBalanceAfterTax();
                    const cumulativeRemainingTotalBalanceAfterTaxMandatory = getCumulativeRemainingTotalBalanceAfterTaxMandatory();
                    const cumulativeRemainingTotalBalanceAfterTaxMandatoryMust = getCumulativeRemainingTotalBalanceAfterTaxMandatoryMust();
                    const cumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers = getCumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers();


                    modifiedResponse.cumulativeRemainingBalances = {
                        "total": {
                            "afterTax": cumulativeRemainingTotalBalanceAfterTax,
                            "afterTaxMandatory": cumulativeRemainingTotalBalanceAfterTaxMandatory,
                            "afterTaxMandatoryMust": cumulativeRemainingTotalBalanceAfterTaxMandatoryMust,
                            "afterTaxMandatoryMustOthers": cumulativeRemainingTotalBalanceAfterTaxMandatoryMustOthers
                        }
                    }
                }


               res.json(modifiedResponse)
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

module.exports = router;