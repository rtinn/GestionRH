// MIGRATION MYSQL: Ce fichier doit être remplacé par server/database-mysql.js
// Les principales différences :
// 1. Remplacer sqlite3 par mysql2
// 2. Utiliser un pool de connexions au lieu d'un fichier
// 3. Adapter la syntaxe SQL (AUTO_INCREMENT, ENUM, etc.)
// 4. Gérer les transactions avec BEGIN/COMMIT/ROLLBACK

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'hr_database.sqlite');

// Configuration SQLite en mode verbose pour le debugging
// MIGRATION MYSQL: Remplacer par mysql.createPool() avec configuration de connexion
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

// Initialisation de la base de données
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs
      // MIGRATION MYSQL: Adapter la syntaxe - utiliser AUTO_INCREMENT et ENUM
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('personnel', 'superieur', 'administrateur')) DEFAULT 'personnel',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des employés (profils détaillés)
      // MIGRATION MYSQL: Adapter les types de données (VARCHAR, TEXT, DECIMAL)
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          position TEXT,
          department TEXT,
          hire_date DATE,
          salary DECIMAL(10,2),
          manager_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (manager_id) REFERENCES employees(id)
        )
      `);

      // Création de l'utilisateur administrateur par défaut
      // MIGRATION MYSQL: Utiliser INSERT IGNORE au lieu de INSERT OR IGNORE
      const adminEmail = 'admin@hr.com';
      const adminPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: "admin123"
      
      db.run(`
        INSERT OR IGNORE INTO users (email, password, role) 
        VALUES (?, ?, 'administrateur')
      `, [adminEmail, adminPassword]);

      // Création du profil employé pour l'admin
      db.run(`
        INSERT OR IGNORE INTO employees (user_id, first_name, last_name, position, department)
        SELECT id, 'Admin', 'Système', 'Administrateur RH', 'Ressources Humaines'
        FROM users WHERE email = ? AND NOT EXISTS (
          SELECT 1 FROM employees WHERE user_id = users.id
        )
      `, [adminEmail]);

      console.log('Base de données initialisée avec succès');
      resolve();
    });
  });
};

export { db, initDatabase };