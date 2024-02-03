const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId

const accounts = {
    Unicredit: "Unicredit",
    Revolut: "Revolut",
    Kreditka: "Kreditka",
    Hotovost: "Hotovost"
}

const expenseTypes = {
    Tax: "Tax",
    Mandatory: "Mandatory",
    Must: "Must",
    Other: "Other"
}

router.get('/expense-types', (req, res) => {
    res.json(expenseTypes);
})

router.get('/accounts', (req, res) => {
    res.json(accounts);
})

module.exports = router;