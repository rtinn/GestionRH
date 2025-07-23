import express from 'express';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../database-mysql.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les employés (Admin et Supérieur)
router.get('/', authenticateToken, requireRole(['administrateur', 'superieur']), async (req, res) => {
  try {
    let sqlQuery = `
      SELECT e.*, u.email, u.role,
             m.first_name as manager_first_name, 
             m.last_name as manager_last_name
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.manager_id = m.id
    `;

    let params = [];

    // Si c'est un supérieur, ne montrer que son équipe
    if (req.user.role === 'superieur') {
      const managers = await query('SELECT id FROM employees WHERE user_id = ?', [req.user.id]);
      
      if (managers.length === 0) {
        return res.status(404).json({ error: 'Profil manager non trouvé' });
      }
      
      sqlQuery += ' WHERE e.manager_id = ? OR e.user_id = ?';
      params = [managers[0].id, req.user.id];
    }

    const employees = await query(sqlQuery, params);
    res.json(employees);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
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

    const result = await transaction(async (connection) => {
      // Créer l'utilisateur
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role || 'personnel']
      );

      const userId = userResult.insertId;

      // Créer le profil employé
      const [employeeResult] = await connection.execute(
        `INSERT INTO employees (user_id, first_name, last_name, phone, address, position, department, hire_date, salary, manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, first_name, last_name, phone, address, position, department, hire_date, salary, manager_id]
      );

      return { userId, employeeId: employeeResult.insertId };
    });

    res.status(201).json({ 
      message: 'Employé créé avec succès', 
      id: result.employeeId,
      user_id: result.userId 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Cet email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
});

// Mettre à jour un employé
router.put('/:id', authenticateToken, requireRole(['administrateur']), async (req, res) => {
  const { id } = req.params;
  const { 
    first_name, last_name, phone, address, position, 
    department, hire_date, salary, manager_id, role 
  } = req.body;

  try {
    await transaction(async (connection) => {
      // Mettre à jour le profil employé
      await connection.execute(
        `UPDATE employees 
         SET first_name = ?, last_name = ?, phone = ?, address = ?, 
             position = ?, department = ?, hire_date = ?, salary = ?, 
             manager_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [first_name, last_name, phone, address, position, department, hire_date, salary, manager_id, id]
      );

      // Mettre à jour le rôle si fourni
      if (role) {
        await connection.execute(
          `UPDATE users 
           SET role = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = (SELECT user_id FROM employees WHERE id = ?)`,
          [role, id]
        );
      }
    });

    res.json({ message: 'Employé mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

// Supprimer un employé (Admin seulement)
router.delete('/:id', authenticateToken, requireRole(['administrateur']), async (req, res) => {
  const { id } = req.params;

  try {
    await transaction(async (connection) => {
      // Récupérer l'user_id avant suppression
      const [employees] = await connection.execute('SELECT user_id FROM employees WHERE id = ?', [id]);
      
      if (employees.length === 0) {
        throw new Error('Employé non trouvé');
      }

      const userId = employees[0].user_id;

      // Supprimer l'employé (cascade supprimera l'utilisateur grâce à la FK)
      await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
      await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    });

    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    if (error.message === 'Employé non trouvé') {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
});

// Récupérer les supérieurs hiérarchiques (pour les dropdowns)
router.get('/managers', authenticateToken, requireRole(['administrateur']), async (req, res) => {
  try {
    const managers = await query(`
      SELECT e.id, e.first_name, e.last_name, e.position, e.department
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE u.role IN ('superieur', 'administrateur')
    `);

    res.json(managers);
  } catch (error) {
    console.error('Erreur lors de la récupération des managers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;