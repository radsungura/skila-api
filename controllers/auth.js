// src/controllers/authController.js
const User = require('../models/users');
const TokenBlacklist = require('../models/tokenblacklist');
const { generateToken, verifyToken } = require('../users/jwt');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({ name, email, password, phone, role });
    
    // Générer le token
    const token = generateToken(user._id.toString(), user.email, user.role);
    
    // Supprimer le mot de passe
    delete user.password;
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: { user, token, expiresIn: 7 * 24 * 60 * 60 }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'inscription'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }
    
    // Mettre à jour lastLogin
    await User.updateLastLogin(user._id);
    
    // Générer le token
    const token = generateToken(user._id.toString(), user.email, user.role);
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    
    // Supprimer le mot de passe
    delete user.password;
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: { user, token, expiresIn }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

const validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, valid: false, message: 'Token requis' });
    }
    
    // Vérifier blacklist
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, valid: false });
    }
    
    // Vérifier token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, valid: false });
    }
    
    // Vérifier utilisateur
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, valid: false });
    }
    
    res.status(200).json({ success: true, valid: true });
  } catch (error) {
    res.status(500).json({ success: false, valid: false });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await TokenBlacklist.add(token);
    }
    res.status(200).json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la déconnexion' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    delete user.password;
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération du profil' });
  }
};

module.exports = { register, login, validateToken, logout, getMe };