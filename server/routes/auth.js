import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Tentative de connexion pour:', email);

  if (!email || !password) {
    console.log('❌ Email ou mot de passe manquant');
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const users = await query(`
      SELECT u.*, e.first_name, e.last_name, e.position, e.department 
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.email = ?
    `, [email]);

    console.log('🔍 Utilisateurs trouvés:', users.length);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé pour:', email);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = users[0];
    console.log('👤 Utilisateur trouvé:', { id: user.id, email: user.email, role: user.role });
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    console.log('🔑 Mot de passe valide:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe invalide pour:', email);
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

    console.log('✅ Connexion réussie pour:', email);

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
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Profil utilisateur actuel
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query(`
      SELECT u.id, u.email, u.role, e.first_name, e.last_name, 
             e.phone, e.address, e.position, e.department, e.hire_date, e.salary
      FROM users u
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;