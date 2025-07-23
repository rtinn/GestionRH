// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// Le dashboard utilise les données via les hooks React, indépendamment de la base de données

import React from 'react';
import { Users, UserCheck, Building, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { employees, loading } = useEmployees();

  // Ne pas afficher les stats si pas d'utilisateur connecté
  if (!user) {
    return <div>Chargement...</div>;
  }
  const stats = [
    {
      name: 'Total Employés',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Supérieurs Hiérarchiques',
      value: employees.filter(emp => emp.role === 'superieur').length,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      name: 'Départements',
      value: new Set(employees.map(emp => emp.department)).size,
      icon: Building,
      color: 'bg-purple-500',
      change: 'Stable',
      changeType: 'neutral',
    },
    {
      name: 'Nouveaux ce mois',
      value: employees.filter(emp => {
        const hireDate = new Date(emp.hire_date || '');
        const currentMonth = new Date().getMonth();
        return hireDate.getMonth() === currentMonth;
      }).length,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3',
      changeType: 'positive',
    },
  ];

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'administrateur':
        return `Bienvenue dans le système de gestion RH, ${user.first_name}. Vous avez un accès complet à toutes les fonctionnalités.`;
      case 'superieur':
        return `Bienvenue ${user.first_name}. Gérez votre équipe et consultez les informations de vos collaborateurs.`;
      default:
        return `Bienvenue ${user.first_name}. Consultez et modifiez vos informations personnelles.`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Dashboard - {user?.role === 'administrateur' ? 'Administration RH' : 
                     user?.role === 'superieur' ? 'Gestion d\'Équipe' : 'Espace Personnel'}
        </h1>
        <p className="text-blue-100">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* Statistiques */}
      {(user?.role === 'administrateur' || user?.role === 'superieur') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Informations récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employés récents */}
        {(user?.role === 'administrateur' || user?.role === 'superieur') && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employés Récemment Ajoutés
            </h3>
            <div className="space-y-3">
              {employees
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {employee.position} - {employee.department}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(employee.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Informations personnelles pour le personnel */}
        {user?.role === 'personnel' && (
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mes Informations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Poste</label>
                <p className="mt-1 text-sm text-gray-900">{user.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Département</label>
                <p className="mt-1 text-sm text-gray-900">{user.department}</p>
              </div>
            </div>
          </div>
        )}

        {/* Raccourcis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Raccourcis
          </h3>
          <div className="space-y-3">
            {user?.role === 'administrateur' && (
              <>
                <button className="w-full text-left p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                  Ajouter un nouvel employé
                </button>
                <button className="w-full text-left p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                  Gérer les supérieurs hiérarchiques
                </button>
              </>
            )}
            {user?.role === 'superieur' && (
              <button className="w-full text-left p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
                Voir mon équipe
              </button>
            )}
            <button className="w-full text-left p-3 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200">
              Modifier mon profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;