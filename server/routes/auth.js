// MIGRATION MYSQL: Ce fichier doit être adapté pour utiliser les requêtes async/await
// Principales modifications :
// 1. Remplacer db.get() par await query()
// 2. Utiliser try/catch au lieu de callbacks
// 3. Adapter la gestion des erreurs MySQL

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js'; // MIGRATION MYSQL: Changer en { query } from '../database-mysql.js'
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

// Connexion
// MIGRATION MYSQL: Remplacer db.get() par await query() avec gestion async/await
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.get(`
    // MIGRATION MYSQL: Cette requête reste identique en syntaxe
    SELECT u.*, e.first_name, e.last_name, e.position, e.department 
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    WHERE u.email = ?
  `, [email], async (err, user) => { // MIGRATION MYSQL: Remplacer par try/catch avec await
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          position: user.position,
          department: user.department
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  });
});

// Profil utilisateur actuel
router.get('/profile', authenticateToken, (req, res) => {
  db.get(`
    SELECT u.id, u.email, u.role, e.first_name, e.last_name, 
           e.phone, e.address, e.position, e.department, e.hire_date, e.salary
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    WHERE u.id = ?
  `, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(user);
  });
});

export default router;