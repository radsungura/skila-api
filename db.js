require("dotenv").config()

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI
const dbName = 'skila';
let db;

const connectToMongo = async () => {
    const client = new MongoClient(url);                                                                                                
  await client.connect();
  db = client.db(dbName);
  console.log('Connected successfully to MongoDB server');
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not connected!');
  }
  return db;
};

module.exports = { connectToMongo, getDb };