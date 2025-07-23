// MIGRATION MYSQL: Modifications mineures nécessaires
// 1. Ajouter dotenv.config() pour les variables d'environnement
// 2. Changer les imports des routes vers les versions MySQL
// 3. Adapter le message de démarrage

import express from 'express';
import cors from 'cors';
// MIGRATION MYSQL: Ajouter import dotenv from 'dotenv'; et dotenv.config();
import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js'; // MIGRATION MYSQL: Changer en './routes/auth-mysql.js'
import employeesRoutes from './routes/employees.js'; // MIGRATION MYSQL: Changer en './routes/employees-mysql.js'

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes);

// Route de test
// MIGRATION MYSQL: Ajouter indication de la base de données utilisée
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Serveur RH en fonctionnement', 
    timestamp: new Date().toISOString()
    // MIGRATION MYSQL: Ajouter database: 'MySQL'
  });
});

// Initialisation et démarrage du serveur
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur RH démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`👤 Admin par défaut: admin@hr.com / admin123`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();