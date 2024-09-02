const express = require('express');
const router = express.Router();
const config = require('../../config.js')
const getDB = require ('../../db').getDB
const ObjectId = require('../../db').ObjectId

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
    const accountId = req.params.id;
    const db = getDB();

    db.collection('accounts')
        .findOne({_id: new ObjectId(accountId)})
        .then(account => {
            if(account) {
                res.json(account);
            } else {
                res.status(404).json({error: 'Account not found'});
            }
        })
        .catch(error => {
            console.error('Error fetching account', error);
            res.status(500).json({error: 'An error occurred while fetching the account'});
        });
});

//update
router.put('/update/:id', (req, res) => {
    const accountId = req.params.id;
    const db = getDB();

    const updatedAccount = {
        name: req.body.name,
        type: req.body.type,
        currency: req.body.currency,
        balance: req.body.balance
    };

    db.collection('accounts')
        .updateOne({_id: new ObjectId(accountId)}, {$set: updatedAccount})
        .then(result => {
            if(result.modifiedCount === 1) {
                // Fetch the updated account
                return db.collection('accounts').findOne({ _id: new ObjectId(accountId) });
            } else {
                res.status(404).send('Account not found');
                throw new Error('Account not found');
            }
        })
        .then(result => {
            // Send the updated account data back to the client
            res.json(result);
        })
        .catch(error => {
            console.error('Error updating account', error);
            if (!res.headersSent) {
                res.status(500).json({error: 'An error occurred while updating the account'});
            }
        });
});

//delete
router.delete('/delete/:id', (req, res) => {
    const accountId = req.params.id;
    const db = getDB();

    db.collection('accounts')
        .deleteOne({_id: new ObjectId(accountId)})
        .then(result => {
            if(result.deletedCount === 1) {
                res.send('Account deleted');
            } else {
                res.send('Account not found');
            }
        })
        .catch(error => {
            console.error('Error deleting account', error);
            res.status(500).json({error: 'An error occurred while deleting the account'});
        });
});

module.exports = router;