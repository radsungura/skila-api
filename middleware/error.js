// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';
  
  // Erreurs MongoDB
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Cette valeur existe déjà';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;