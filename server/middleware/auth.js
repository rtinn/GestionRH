// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// L'authentification JWT est indépendante de la base de données

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware:', {
    authHeader,
    token: token ? 'Present' : 'Missing',
    headers: req.headers
  });
  if (!token) {
    console.log('Token manquant');
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token invalide:', err.message);
      return res.status(403).json({ error: 'Token invalide' });
    }
    console.log('Token valide pour utilisateur:', user.email);
    req.user = user;
    next();
  });
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - Privilèges insuffisants' });
    }
    next();
  };
};