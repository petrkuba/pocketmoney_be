const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();

//const mongoDBurl = 'mongodb://mongo-container:27017'
const mongoDBurl = process.env.MONGODB_CONN_STRING
//const mongoDBurl = 'mongodb://localhost:27018'

let _db
//let db_name = 'pocketmoney_dev'
let db_name= process.env.MONGODB_DATABASE_NAME


const mongoConnect = (callback) => {
    MongoClient.connect(mongoDBurl, { useUnifiedTopology: true })
        .then(client => {
            console.log('Connected to Database')
            _db = client.db(db_name)
            callback();
            })
        .catch(error => {
            console.log(error)
            throw new Error('DB connection failed')
        })
    }


const getDB = () => {
    if (_db) {
        return _db
    } else {
        console.log('DB connection failed')
        throw new Error('DB connection failed')
    }
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
exports.ObjectId = ObjectId;
