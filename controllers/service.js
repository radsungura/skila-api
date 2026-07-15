// src/controllers/serviceController.js
const Service = require('../models/service');
const { ObjectId } = require('mongodb');

const createService = async (req, res) => {
  try {
    const serviceData = { ...req.body, provider: req.user._id };
    const service = await Service.create(serviceData);
    
    res.status(201).json({
      success: true,
      message: 'Service créé avec succès',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création'
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, location, minPrice, maxPrice, search, featured, status, provider } = req.query;
    
    const filters = { category, location, minPrice, maxPrice, search, featured };
      
    // Gestion des droits
    if (provider) {
      filters.provider = provider;
    } else if (req.user && req.user.role === 'provider') {
      filters.provider = req.user._id;
    } else {
      filters.status = status || 'active';
    }
    
    const result = await Service.findAll(filters, page, limit);
    
    res.status(200).json({
      success: true,
      data: result,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    // Vérifier les droits d'accès
    if (service.status !== 'active' && 
        (!req.user || (req.user.role !== 'admin' && service.provider?._id?.toString() !== req.user._id?.toString()))) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }
    
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération' });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    const isOwner = service.provider?._id?.toString() === req.user._id?.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission refusée' });
    }
    
    await Service.update(req.params.id, req.body);
    const updatedService = await Service.findById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Service mis à jour',
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    const isOwner = service.provider?._id?.toString() === req.user._id?.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Permission refusée' });
    }
    
    await Service.delete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Service supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }
    
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    if (service.provider?._id?.toString() !== req.user._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Permission refusée' });
    }
    
    await Service.update(req.params.id, { status });
    
    res.status(200).json({ success: true, message: `Service ${status === 'active' ? 'activé' : 'désactivé'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du changement de statut' });
  }
};

const getProviderStats = async (req, res) => {
  try {
    const stats = await Service.getStats(req.user._id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des stats' });
  }
};

const approveService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    await Service.update(req.params.id, { status: 'active' });
    res.status(200).json({ success: true, message: 'Service approuvé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'approbation' });
  }
};

const toggleFeature = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service non trouvé' });
    }
    
    await Service.update(req.params.id, { featured: !service.featured });
    res.status(200).json({ success: true, message: 'Service mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour' });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceStatus,
  getProviderStats,
  approveService,
  toggleFeature
};