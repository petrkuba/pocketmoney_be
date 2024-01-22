const express = require('express');
const router= express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId

//calculate cumulative balances and update in budget
function updateRemainingCumulativeBalances (budgetId) {
    const db = getDB();
    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetId) }

        )
};



