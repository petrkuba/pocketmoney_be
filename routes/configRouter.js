const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId
const config = require('../config.js')

router.get('/expense-types', (req, res) => {
    res.json(config.expenseTypes);
})

router.get('/accounts', (req, res) => {
    res.json(config.accounts);
})

//MANDATORY EXPENSES

function validateNewUpdateRequest(req, res, next) {

  if (!req.body.expenseName) {
    console.log("From server: \'Name\' field is missing in the request ");
    return res.status(400).send('From server: Missing mandatory field: \'name\'');
  }

  if (!req.body.expenseAmount) {
    console.log("From server: \'Amount\' field is missing in the request ");
    return res.status(400).send('From server: Missing mandatory field: \'Amount\'');
  }

  if (!req.body.expenseAccount) {
    console.log("From server: \'Account\' field is missing in the request ");
    return res.status(400).send('From server: Missing mandatory field: \'Account\'');
  }

  next(); // Call next() to proceed to the next middleware or route handler
}

//List
router.get('/mandatoryExpenses/list', (req, res) => {
   const db = getDB();
   db.collection('mandatoryExpenses')
       .find({}, {projection:{_id:1, expenseName:1, expenseAmount:1, expenseAccount:1}})
       .toArray()
       .then(results => {
           res.json(results)
       })
       .catch(error => console.error(error))
})

//New
router.post('/mandatoryExpenses/new', validateNewUpdateRequest, (req, res) => {

    const newMandatoryExpense = req.body;
    const db = getDB();
    db.collection('mandatoryExpenses')
        .insertOne(newMandatoryExpense)
        .then(result => {
            const insertedId = result.insertedId;
            res.json({ insertedId });
        })
        .catch(error => console.error('Error inserting Mandatory expense', error));

})

//Update
router.put('/mandatoryExpenses/update/:id', validateNewUpdateRequest, (req, res) => {

    const expenseid = req.params.id;

    //validate expenseid format
    if(!ObjectId.isValid(expenseid)) {
        return res.status(400).json({error: 'Invalid Mandatory expense id format'});
    }

    //update in DB
    const db = getDB();
    db.collection('mandatoryExpenses')
        .updateOne(
            {_id: new ObjectId(expenseid)},
            {$set: {
                expenseName: req.body.expenseName,
                expenseAmount: req.body.expenseAmount,
                expenseAccount: req.body.expenseAccount
                }
            }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.send("Mandatory expense updated");
                }
            else {
                res.send("No Mandatory expense found or no changes sent for the given ID");
                }
            }
        )
        .catch(error => console.log('From server: Error updating Mandatory expense configuration', error));

});

//Delete
router.delete('/mandatoryExpenses/delete/:id', (req, res) => {
  const expenseId = req.params.id;
  const db = getDB();

  db.collection('mandatoryExpenses')
    .deleteOne({ _id: new ObjectId(expenseId) })
    .then(() => {
      res.json({ message: 'From server: Mandatory expense deleted' });
      console.log("Mandatory expense deleted")
    })
    .catch(error => {
      console.error('From server: Error deleting mandatory expense', error);
      res.status(500).json({ error: 'From server: Error deleting mandatory expense' });
    });
});

module.exports = router;