import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hr_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Création du pool de connexions
const pool = mysql.createPool(dbConfig);

// Fonction utilitaire pour exécuter des requêtes
export const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur de requête MySQL:', error);
    throw error;
  }
};

// Fonction utilitaire pour les transactions
export const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Initialisation de la base de données
export const initDatabase = async () => {
  try {
    // Vérifier la connexion
    await pool.getConnection();
    console.log('✅ Connexion MySQL établie avec succès');

    // Créer les tables si elles n'existent pas
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('personnel', 'superieur', 'administrateur') DEFAULT 'personnel',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS employees (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Créer l'utilisateur administrateur par défaut
    const adminEmail = 'admin@hr.com';
    const adminPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: "admin123"
    
    const existingAdmin = await query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (existingAdmin.length === 0) {
      const adminResult = await query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [adminEmail, adminPassword, 'administrateur']
      );

      await query(
        'INSERT INTO employees (user_id, first_name, last_name, position, department) VALUES (?, ?, ?, ?, ?)',
        [adminResult.insertId, 'Admin', 'Système', 'Administrateur RH', 'Ressources Humaines']
      );
    }

    console.log('✅ Base de données MySQL initialisée avec succès');
    console.log('👤 Admin par défaut: admin@hr.com / admin123');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

// Fermeture propre du pool de connexions
export const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('✅ Connexions MySQL fermées proprement');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture des connexions:', error);
  }
};

// Gestion de la fermeture propre de l'application
process.on('SIGINT', async () => {
  console.log('\n🔄 Fermeture de l\'application...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Fermeture de l\'application...');
  await closeDatabase();
  process.exit(0);
});

export default pool;