// src/models/User.js
const { getDb } = require('../db.js');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const COLLECTION = 'users';

const User = {
  // Créer un utilisateur
  create: async (userData) => {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'client',
      phone: userData.phone || null,
      avatar: userData.avatar || null,
      isActive: true,
      emailVerified: false,
      lastLogin: null,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(user);
    return { _id: result.insertedId, ...user };
  },
  
  // Trouver par email
  findByEmail: async (email) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
  },
  
  // Trouver par ID
  findById: async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  },
  
  // Trouver par ID avec mot de passe
  findByIdWithPassword: async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  },
  
  // Mettre à jour
  update: async (id, updateData) => {
    const db = getDb();
    const { _id, ...data } = updateData;
    return await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
  },
  
  // Supprimer
  delete: async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  },
  
  // Lister avec filtres
  findAll: async (filter = {}, page = 1, limit = 10) => {
    const db = getDb();
    const skip = (page - 1) * limit;
    
    const users = await db.collection(COLLECTION)
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await db.collection(COLLECTION).countDocuments(filter);
    
    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  },
  
  // Mettre à jour le dernier login
  updateLastLogin: async (id) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLogin: new Date() } }
    );
  },
  
  // Sauvegarder refresh token
  saveRefreshToken: async (id, refreshToken) => {
    const db = getDb();
    return await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { refreshToken } }
    );
  }
};

module.exports = User;