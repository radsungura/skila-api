// src/models/Service.js
const { getDb } = require('../db.js');
const { ObjectId } = require('mongodb');

const COLLECTION = 'providers';

const Service = {
  // Créer un service
  create: async (serviceData) => {
    const db = getDb();
    
    const service = {
      name: serviceData.name,
      category: serviceData.category,
      description: serviceData.description,
      price: serviceData.price,
      location: serviceData.location,
      duration: serviceData.duration || 'À définir',
      image: serviceData.image || Service.getCategoryIcon(serviceData.category),
      images: serviceData.images || [],
      status: serviceData.status || 'active',
      provider: new ObjectId(serviceData.provider),
      featured: serviceData.featured || false,
      rating: 0,
      reviewsCount: 0,
      tags: serviceData.tags || [],
      availability: serviceData.availability || {
        monday: true, tuesday: true, wednesday: true,
        thursday: true, friday: true, saturday: true, sunday: false
      },
      minNoticeDays: serviceData.minNoticeDays || 3,
      maxCapacity: serviceData.maxCapacity || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(service);
    return { _id: result.insertedId, ...service };
  },
  
  // Trouver par ID
  findById: async (id) => {
    const db = getDb();
    const service = await db.collection(COLLECTION).aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } }
    ]).toArray();
    
    return service[0] || null;
  },
  
  // Trouver tous les services avec filtres
  findAll: async (filters = {}, page = 1, limit = 10) => {
    const db = getDb();
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filtre par catégorie
    if (filters.category && filters.category !== 'Tous') {
      query.category = filters.category;
    }
    
    // Filtre par statut
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'active';
    }
    
    // Filtre par prestataire
    if (filters.provider) {
      query.provider = new ObjectId(filters.provider);
    }
    
    // Filtre par prix
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseInt(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseInt(filters.maxPrice);
    }
    
    // Filtre par localisation
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }
    
    // Filtre featured
    if (filters.featured === 'true') {
      query.featured = true;
    }
    
    // Recherche textuelle
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }
    
    const services = await db.collection(COLLECTION)
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'provider',
            foreignField: '_id',
            as: 'provider'
          }
        },
        { $unwind: { path: '$provider', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]).toArray();
    
    const total = await db.collection(COLLECTION).countDocuments(query);
    
    return {
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
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
  
  // Trouver par prestataire
  findByProvider: async (providerId, status = null, page = 1, limit = 10) => {
    const db = getDb();
    const skip = (page - 1) * limit;
    
    const query = { provider: new ObjectId(providerId) };
    if (status) query.status = status;
    
    const services = await db.collection(COLLECTION)
      .find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await db.collection(COLLECTION).countDocuments(query);
    
    return { services, total, page, limit, pages: Math.ceil(total / parseInt(limit)) };
  },
  
  // Statistiques par prestataire
  getStats: async (providerId) => {
    const db = getDb();
    
    const stats = await db.collection(COLLECTION).aggregate([
      { $match: { provider: new ObjectId(providerId) } },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          activeServices: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactiveServices: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          totalRevenue: { $sum: '$price' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]).toArray();
    
    const byCategory = await db.collection(COLLECTION).aggregate([
      { $match: { provider: new ObjectId(providerId) } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    return { stats: stats[0] || {}, byCategory };
  },
  
  // Icône par catégorie
  getCategoryIcon: (category) => {
    const icons = {
      'Music Band': '🎵',
      'Decoration': '🎨',
      'Traiteur': '🍽️',
      'Photographie': '📸',
      'Animation': '🎭',
      'Son & Lumière': '🔊'
    };
    return icons[category] || '🎯';
  }
};

module.exports = Service;