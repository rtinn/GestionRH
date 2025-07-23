import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database-mysql.js';
import authRoutes from './routes/auth-mysql.js';
import employeesRoutes from './routes/employees-mysql.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeesRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Serveur RH MySQL en fonctionnement', 
    timestamp: new Date().toISOString(),
    database: 'MySQL'
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Initialisation et démarrage du serveur
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur RH MySQL démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🗄️  Base de données: MySQL`);
      console.log(`👤 Admin par défaut: admin@hr.com / admin123`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();