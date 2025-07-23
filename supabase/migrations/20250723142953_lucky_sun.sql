-- Script de création de la base de données MySQL pour le système RH
-- Exécuter ce script dans votre client MySQL avant de démarrer l'application

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS hr_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hr_database;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('personnel', 'superieur', 'administrateur') DEFAULT 'personnel',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des employés
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  position VARCHAR(255),
  department VARCHAR(255),
  hire_date DATE,
  salary DECIMAL(10,2),
  manager_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_manager_id (manager_id),
  INDEX idx_department (department),
  INDEX idx_hire_date (hire_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de l'administrateur par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT IGNORE INTO users (email, password, role) 
VALUES ('admin@hr.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrateur');

-- Insertion du profil employé pour l'admin
INSERT IGNORE INTO employees (user_id, first_name, last_name, position, department)
SELECT id, 'Admin', 'Système', 'Administrateur RH', 'Ressources Humaines'
FROM users 
WHERE email = 'admin@hr.com' 
AND NOT EXISTS (SELECT 1 FROM employees WHERE user_id = users.id);

-- Affichage des informations de connexion
SELECT 'Base de données créée avec succès!' as message;
SELECT 'Compte admin: admin@hr.com / admin123' as login_info;