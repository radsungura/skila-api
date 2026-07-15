// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  validateToken,
  logout,
  getMe
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const {
  validate,
  registerValidation,
  loginValidation
} = require('../middleware/validation');

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/validate-token', protect, validateToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);      
module.exports = router;  
