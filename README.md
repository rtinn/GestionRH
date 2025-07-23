# Système de Gestion des Ressources Humaines

Application complète de gestion RH avec React, Node.js et MySQL.

## 🚀 Fonctionnalités

### Acteurs du système
- **Personnel** : Consultation et modification de son profil
- **Supérieur Hiérarchique** : Gestion de son équipe
- **Administrateur** : Accès complet au système

### Fonctionnalités principales
- ✅ Authentification JWT avec gestion des rôles
- ✅ Dashboard personnalisé par type d'utilisateur
- ✅ CRUD complet des employés (Admin)
- ✅ Gestion hiérarchique des équipes
- ✅ Interface responsive et moderne
- ✅ Import/Export Excel (à venir)

## 🛠️ Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS, Vite
- **Backend** : Node.js, Express, JWT
- **Base de données** : MySQL 8.0+
- **ORM** : Requêtes SQL natives avec mysql2

## 📋 Prérequis

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd hr-management-system
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration MySQL

#### Créer la base de données
```bash
mysql -u root -p < scripts/setup-mysql.sql
```

#### Configurer les variables d'environnement
Copier `.env.example` vers `.env` et configurer :
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hr_database
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_super_secure_jwt_secret
PORT=3001
```

### 4. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- API : http://localhost:3001/api

## 👤 Compte par défaut

- **Email** : admin@hr.com
- **Mot de passe** : admin123
- **Rôle** : Administrateur

## 📁 Structure du projet

```
├── src/                    # Frontend React
│   ├── components/         # Composants React
│   ├── contexts/          # Contextes (Auth, etc.)
│   ├── hooks/             # Hooks personnalisés
│   ├── lib/               # Utilitaires
│   └── types/             # Types TypeScript
├── server/                # Backend Node.js
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares
│   ├── database.js        # Configuration MySQL
│   └── index.js           # Serveur principal
└── scripts/               # Scripts SQL
```

## 🔐 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt
- Validation des rôles côté serveur
- Protection CORS configurée
- Requêtes préparées contre l'injection SQL

## 📊 Base de données

### Tables principales
- `users` : Comptes utilisateurs et authentification
- `employees` : Profils détaillés des employés

### Relations
- Un utilisateur peut avoir un profil employé
- Un employé peut avoir un supérieur hiérarchique
- Contraintes de clés étrangères avec CASCADE

## 🚀 Déploiement

### Production
1. Configurer une base MySQL de production
2. Mettre à jour les variables d'environnement
3. Builder le frontend : `npm run build`
4. Déployer sur votre serveur

### Docker (optionnel)
```bash
# À venir : configuration Docker
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails.