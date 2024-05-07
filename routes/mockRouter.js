const express = require('express');
const router = express.Router();
const getDB = require ('../db').getDB
const ObjectId = require('../db').ObjectId

//calculate cumulative balances and update in budget
/*function updateRemainingCumulativeBalances (budgetId) {
    const db = getDB();
    db.collection('budgets')
        .updateOne(
            { _id: new ObjectId(budgetId) }

        )
};
*/


const mockedBudget = {

    "_id": {
        "$oid": "65771f8e099f3c97098eff73"
    },
    "name": "Mock",
    "expenses": [
        {
            "_id": {
                "$oid": "65771fa1099f3c97098eff74"
            },
            "expenseName": "Hory",
            "expenseType": "Other",
            "plannedAmount": "48000",
            "paidAmount": "",
            "remainingAmount": "48000",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "65786104c39cbdbbbd010c89"
            },
            "expenseName": "Nájem",
            "expenseType": "Mandatory",
            "plannedAmount": "36250",
            "paidAmount": "",
            "remainingAmount": "36500",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "65786143c39cbdbbbd010c8a"
            },
            "expenseName": "Hypotéka",
            "expenseType": "Mandatory",
            "plannedAmount": "8394",
            "paidAmount": "",
            "remainingAmount": "8394",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "65786159c39cbdbbbd010c8b"
            },
            "expenseName": "DPH",
            "expenseType": "Tax",
            "plannedAmount": "39270",
            "paidAmount": "",
            "remainingAmount": "39270",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "6578616dc39cbdbbbd010c8c"
            },
            "expenseName": "Telefon",
            "expenseType": "Mandatory",
            "plannedAmount": "3800",
            "paidAmount": "",
            "remainingAmount": "3600",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "65786186c39cbdbbbd010c8d"
            },
            "expenseName": "Transit",
            "expenseType": "Mandatory",
            "plannedAmount": "10000",
            "paidAmount": "",
            "remainingAmount": "10000",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "6578619ec39cbdbbbd010c8e"
            },
            "expenseName": "mBank",
            "expenseType": "Mandatory",
            "plannedAmount": "18000",
            "paidAmount": "",
            "remainingAmount": "18000",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "6579543fc39cbdbbbd010c8f"
            },
            "expenseName": "Předplatný",
            "expenseType": "Mandatory",
            "plannedAmount": "737",
            "paidAmount": "",
            "remainingAmount": "737",
            "expenseAccount": "Revolut"
        },
        {
            "_id": {
                "$oid": "658ee38d757d0c382e33eaf8"
            },
            "expenseName": "Potraviny",
            "expenseType": "Must",
            "plannedAmount": "14000",
            "paidAmount": "",
            "remainingAmount": "14000",
            "expenseAccount": "Revolut"
        },
        {
            "_id": {
                "$oid": "658ee39d757d0c382e33eaf9"
            },
            "expenseName": "Benzín",
            "expenseType": "Must",
            "plannedAmount": "4000",
            "paidAmount": "",
            "remainingAmount": "4000",
            "expenseAccount": "Revolut"
        },
        {
            "_id": {
                "$oid": "6590197080fe6bf488f6be74"
            },
            "expenseName": "Verča tenis",
            "expenseType": "Must",
            "plannedAmount": "5200",
            "paidAmount": "",
            "remainingAmount": "5200",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "6590197d80fe6bf488f6be75"
            },
            "expenseName": "Verča piano",
            "expenseType": "Must",
            "plannedAmount": "2000",
            "paidAmount": "",
            "remainingAmount": "2000",
            "expenseAccount": "Unicredit"
        },
        {
            "_id": {
                "$oid": "6590198a80fe6bf488f6be76"
            },
            "expenseName": "Holky kapesný",
            "expenseType": "Must",
            "plannedAmount": "3000",
            "paidAmount": "",
            "remainingAmount": "3000",
            "expenseAccount": "Revolut"
        },
        {
            "_id": {
                "$oid": "65a10b247244281e760c569b"
            },
            "expenseName": "Máma dárek k narozeninám",
            "expenseType": "Other",
            "plannedAmount": "2000",
            "paidAmount": "",
            "remainingAmount": "2000",
            "expenseAccount": "Unicredit"
        }
    ],
    "balances": [
        {
            "_id": {
                "$oid": "6578602bc39cbdbbbd0108"
            },
            "account": "Unicredit",
            "plannedBalance": 20000,
            "currentBalance": 15000,
            "remainingBalancesAfter": [
                {
                    "expenseType": "Tax",
                    "amount": 1500,
                },
                {
                    "expenseType": "Mandatory",
                    "amount": 1200,
                },
                {
                    "expenseType": "Must",
                    "amount": 1000,
                },
                {
                    "expenseType": "Other",
                    "amount": 800,
                }
            ]
        },
        {
            "_id": {
                "$oid": "65786bc39cbdbbbd010c88"
            },
            "account": "Revolut",
            "currentBalance": 15000,
            "plannedBalance": 10000,
            "remainingBalancesAfter": [
                {
                    "expenseType": "Tax",
                    "amount": 8000,
                },
                {
                    "expenseType": "Mandatory",
                    "amount": 6000,
                },
                {
                    "expenseType": "Must",
                    "amount": 5000,
                },
                {
                    "expenseType": "Other",
                    "amount": 800,
                }
            ]
        },
        {
            "_id": {
                "$oid": "6578602bc39cbbbd010c88"
            },
            "account": "Kreditka",
            "currentBalance": 10000,
            "plannedBalance": 8000,
            "remainingBalancesAfter": [
                {
                    "expenseType": "Tax",
                    "amount": 8000,
                },
                {
                    "expenseType": "Mandatory",
                    "amount": 6000,
                },
                {
                    "expenseType": "Must",
                    "amount": 6000,
                },
                {
                    "expenseType": "Other",
                    "amount": 2000,
                }
            ]
        }
    ],
    "balancesSums": {
        "plannedBalanceSum": 180000,
        "remainingBalanceSum": 160000,
        "remainingTotalBalancesAfter": [
            {
                "expenseType": "Tax",
                "amount": 150000
            },
            {
                "expenseType": "Mandatory",
                "amount": 140000
            },
            {
                "expenseType": "Must",
                "amount": 6000
            },
            {
                "expenseType": "Other",
                "amount": 2000
            }
        ]
    },
    "expensesSums": [
        {   "expenseType": "Tax",
            "totalExpensePlannedAmount": 5555,
            "totalExpenseRemainingAmount": 4444,
            "totalExpensePaidAmount": 3333
        },
        {   "expenseType": "Mandatory",
            "totalExpensePlannedAmount": 6666,
            "totalExpenseRemainingAmount": 5555,
            "totalExpensePaidAmount": 4444
        },
        {   "expenseType": "Must",
            "totalExpensePlannedAmount": 7777,
            "totalExpenseRemainingAmount": 6666,
            "totalExpensePaidAmount": 5555
        },
        {   "expenseType": "Other",
            "totalExpensePlannedAmount": 8888,
            "totalExpenseRemainingAmount": 7777,
            "totalExpensePaidAmount": 6666
        }
    ]
}
router.get('/budget',(req,res) => {
    res.json(mockedBudget);
})





module.exports = router;
