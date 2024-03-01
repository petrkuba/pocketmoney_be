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

module.exports = router;