// require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const express = require("express");
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.get('/providers', protect, authorize('client'), async (req, res) => {
  const db = req.db;
  const providersCollection = db.collection('providers');
  const providers  = await providersCollection.find({}).toArray();
  console.log("providers", providers);
  res.send(providers);
});

router.get("/providers/:id", protect, authorize('admin'), async (req, res) => {
  const db = req.db;
  const collection = db.collection('providers');
  const providers = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!providers) {
      res.status(404).send({ message: "No data match your research" });
    }
     res.status(200).json(providers);
})

// Add a new providers

router.post('/providers', protect, authorize('admin'), async (req, res) => {
  const db = req.db;
  console.log(req);
  const collection = db.collection('providers');
  const result = await collection.insertOne(req.body);
  res.json(result);
});

// Update a providers by ID

router.put('/providers/:id', protect, authorize('admin'), async (req, res) => {
  const db = req.db;
  const collection = db.collection('providers');
  const result = await collection.updateOne({ _id: new ObjectId(req.params.id) },{ $set: req.body });
  res.status(200).json(result);
  console.log("set data", req.body);

});

// Delete a providers by ID

router.delete('/providers/:id', protect, authorize('admin'), async (req, res) => {
  const db = req.db;
  const collection = db.collection('providers');
  const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});
module.exports = router;
