// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateServiceStatus,
  getProviderStats,
  approveService,
  toggleFeature
} = require('../controllers/service');
const { protect, authorize } = require('../middleware/auth');
const { validate, createServiceValidation } = require('../middleware/validation');

// Routes publiques
router.get('/services', getAllServices);
router.get('/stats/provider', protect, authorize('provider'), getProviderStats);
router.get('/:id', getServiceById);

// Routes prestataires
router.post('/services', protect, authorize('provider'), validate(createServiceValidation), createService);
router.put('/:id', protect, updateService);
router.patch('/:id/status', protect, authorize('provider'), updateServiceStatus);
router.delete('/:id', protect, deleteService);

// Routes admin
router.patch('/:id/approve', protect, authorize('admin'), approveService);
router.patch('/:id/feature', protect, authorize('admin'), toggleFeature);

module.exports = router;