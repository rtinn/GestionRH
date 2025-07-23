# Guide de Migration SQLite vers MySQL

## 1. Installation des dépendances

Remplacer SQLite par MySQL dans package.json :

```bash
npm uninstall sqlite3
npm install mysql2
```

## 2. Configuration de la base de données

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hr_database
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=votre_secret_jwt_super_securise
PORT=3001
```

## 3. Fichiers à modifier

### server/database.js - Remplacement complet
### server/routes/auth.js - Modifications mineures
### server/routes/employees.js - Modifications mineures
### package.json - Dépendances

## 4. Script de création de base MySQL

```sql
CREATE DATABASE hr_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hr_database;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('personnel', 'superieur', 'administrateur') DEFAULT 'personnel',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
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
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Insertion de l'administrateur par défaut
INSERT INTO users (email, password, role) 
VALUES ('admin@hr.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrateur');

INSERT INTO employees (user_id, first_name, last_name, position, department)
VALUES (1, 'Admin', 'Système', 'Administrateur RH', 'Ressources Humaines');
```

## 5. Commandes de démarrage

```bash
# Installer les nouvelles dépendances
npm install mysql2 dotenv

# Créer le fichier .env avec vos paramètres MySQL

# Démarrer l'application
npm run dev
```

## 6. Avantages de MySQL vs SQLite

- **Performance** : Meilleure pour les applications multi-utilisateurs
- **Concurrence** : Gestion native des accès simultanés
- **Sécurité** : Authentification et permissions avancées
- **Scalabilité** : Support de grandes bases de données
- **Fonctionnalités** : Triggers, procédures stockées, vues complexes