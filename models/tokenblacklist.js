// src/models/TokenBlacklist.js
const { getDb } = require('../db.js');

const COLLECTION = 'token_blacklist';

const TokenBlacklist = {
  // Ajouter un token à la blacklist
  add: async (token, expiresIn = 7 * 24 * 60 * 60 * 1000) => {
    const db = getDb();
    const expiresAt = new Date(Date.now() + expiresIn);
    
    const tokenData = {
      token,
      expiresAt,
      createdAt: new Date()
    };
    
    await db.collection(COLLECTION).insertOne(tokenData);
    return tokenData;
  },
  
  // Vérifier si un token est blacklisté
  isBlacklisted: async (token) => {
    const db = getDb();
    const result = await db.collection(COLLECTION).findOne({ token });
    return !!result;
  },
  
  // Supprimer un token expiré (automatique via TTL)
  removeExpired: async () => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteMany({ expiresAt: { $lt: new Date() } });
  }
};

module.exports = TokenBlacklist;