const express = require('express');
const router = express.Router();
const getDB = require ('../../db').getDB
const ObjectId = require('../../db').ObjectId
const config = require('../../config.js')

//List
router.get('/', (req, res) => {
    res.json(config.expenseTypes);
})

module.exports = router;