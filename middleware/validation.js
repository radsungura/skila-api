// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  };
};

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Les mots de passe ne correspondent pas'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{8,15}$/).withMessage('Numéro de téléphone invalide'),
  body('role')
    .optional()
    .isIn(['client', 'provider']).withMessage('Rôle invalide')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide'),
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

const createServiceValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  body('category')
    .isIn(['Music Band', 'Decoration', 'Traiteur', 'Photographie', 'Animation', 'Son & Lumière'])
    .withMessage('Catégorie invalide'),
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('location')
    .trim()
    .notEmpty().withMessage('La localisation est requise')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createServiceValidation
};