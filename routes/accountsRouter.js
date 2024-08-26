const express = require('express');
const router = express.Router();
const config = require('../config.js')
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId

//List
router.get('/list', (req, res) => {
        const db = getDB();
        db.collection('accounts')
            .find({}, {projection:{_id:1, name:1, balance:1, currency:1, type:1}})
            .toArray()
            .then(accounts => {
                res.json(accounts);
            })
        .catch(error => console.error('Error fetching accounts', error));
});

//new
router.post('/new', (req, res) => {

    const db = getDB();

    const newAccount = {
        name: req.body.name,
        type: req.body.type,
        currency: req.body.currency,
        balance: req.body.balance
    };

   db.collection('accounts')
    .insertOne(newAccount)
    .then(result => {
        // Get the newly inserted account with the insertedId
        return db.collection('accounts').findOne({ _id: result.insertedId });
    })
    .then(insertedAccount => {
        res.json(insertedAccount); // Send the newly inserted account data back to the client
    })
    .catch(error => console.error('Error when inserting new account', error));

});

//detail
router.get('/:id', (req, res) => {
});

//update
router.put('update/:id', () => {
});

//delete
router.delete('delete/:id', () => {
});

module.exports = router;