// MIGRATION MYSQL: Ce fichier nécessite des modifications importantes
// Principales adaptations :
// 1. Remplacer tous les db.get/db.all/db.run par await query()
// 2. Utiliser des transactions MySQL avec connection.beginTransaction()
// 3. Adapter la gestion des erreurs (ER_DUP_ENTRY au lieu de SQLITE_CONSTRAINT)
// 4. Utiliser insertId au lieu de lastID

import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.js'; // MIGRATION MYSQL: Changer en { query, transaction } from '../database-mysql.js'
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les employés (Admin et Supérieur)
// MIGRATION MYSQL: Remplacer db.all() par await query() avec gestion async/await
router.get('/', authenticateToken, requireRole(['administrateur', 'superieur']), (req, res) => {
  let query = `
    // MIGRATION MYSQL: Cette requête SQL reste identique
    SELECT e.*, u.email, u.role,
           m.first_name as manager_first_name, 
           m.last_name as manager_last_name
    FROM employees e
    JOIN users u ON e.user_id = u.id
    LEFT JOIN employees m ON e.manager_id = m.id
  `;

  // Si c'est un supérieur, ne montrer que son équipe
  // MIGRATION MYSQL: Adapter la logique avec await/async
  if (req.user.role === 'superieur') {
    db.get('SELECT id FROM employees WHERE user_id = ?', [req.user.id], (err, manager) => {
      if (err || !manager) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      query += ' WHERE e.manager_id = ? OR e.user_id = ?';
      db.all(query, [manager.id, req.user.id], (err, employees) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(employees);
      });
    });
  } else {
    db.all(query, (err, employees) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(employees);
    });
  }
});

// Ajouter un employé (Admin seulement)
router.post('/', authenticateToken, requireRole(['administrateur']), async (req, res) => {
  const { 
    email, password, role, first_name, last_name, 
    phone, address, position, department, hire_date, salary, manager_id 
  } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('BEGIN TRANSACTION');

    // Créer l'utilisateur
    db.run(`
      INSERT INTO users (email, password, role)
      VALUES (?, ?, ?)
    `, [email, hashedPassword, role || 'personnel'], function(err) {
      if (err) {
        db.run('ROLLBACK');
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Cet email existe déjà' });
        }
        return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
      }

      const userId = this.lastID;

      // Créer le profil employé
      db.run(`
        INSERT INTO employees (user_id, first_name, last_name, phone, address, position, department, hire_date, salary, manager_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, first_name, last_name, phone, address, position, department, hire_date, salary, manager_id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Erreur lors de la création du profil employé' });
        }

        db.run('COMMIT');
        res.status(201).json({ 
          message: 'Employé créé avec succès', 
          id: this.lastID,
          user_id: userId 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour un employé
router.put('/:id', authenticateToken, requireRole(['administrateur']), (req, res) => {
  const { id } = req.params;
  const { 
    first_name, last_name, phone, address, position, 
    department, hire_date, salary, manager_id, role 
  } = req.body;

  db.run('BEGIN TRANSACTION');

  // Mettre à jour le profil employé
  db.run(`
    UPDATE employees 
    SET first_name = ?, last_name = ?, phone = ?, address = ?, 
        position = ?, department = ?, hire_date = ?, salary = ?, 
        manager_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [first_name, last_name, phone, address, position, department, hire_date, salary, manager_id, id], (err) => {
    if (err) {
      db.run('ROLLBACK');
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }

    // Mettre à jour le rôle si fourni
    if (role) {
      db.run(`
        UPDATE users 
        SET role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT user_id FROM employees WHERE id = ?)
      `, [role, id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
        }

        db.run('COMMIT');
        res.json({ message: 'Employé mis à jour avec succès' });
      });
    } else {
      db.run('COMMIT');
      res.json({ message: 'Employé mis à jour avec succès' });
    }
  });
});

// Supprimer un employé (Admin seulement)
router.delete('/:id', authenticateToken, requireRole(['administrateur']), (req, res) => {
  const { id } = req.params;

  db.run('BEGIN TRANSACTION');

  // Récupérer l'user_id avant suppression
  db.get('SELECT user_id FROM employees WHERE id = ?', [id], (err, employee) => {
    if (err || !employee) {
      db.run('ROLLBACK');
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Supprimer l'employé
    db.run('DELETE FROM employees WHERE id = ?', [id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
      }

      // Supprimer l'utilisateur
      db.run('DELETE FROM users WHERE id = ?', [employee.user_id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
        }

        db.run('COMMIT');
        res.json({ message: 'Employé supprimé avec succès' });
      });
    });
  });
});

// Récupérer les supérieurs hiérarchiques (pour les dropdowns)
router.get('/managers', authenticateToken, requireRole(['administrateur']), (req, res) => {
  db.all(`
    SELECT e.id, e.first_name, e.last_name, e.position, e.department
    FROM employees e
    JOIN users u ON e.user_id = u.id
    WHERE u.role IN ('superieur', 'administrateur')
  `, (err, managers) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(managers);
  });
});

export default router;