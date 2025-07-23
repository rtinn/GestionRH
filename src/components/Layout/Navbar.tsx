// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// Les composants React frontend sont indépendants de la base de données backend

import React from 'react';
import { Users, LogOut, User, Settings, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'administrateur':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'employees', label: 'Employés', icon: Users },
          { id: 'managers', label: 'Supérieurs', icon: UserCheck },
          { id: 'profile', label: 'Mon Profil', icon: User }
        ];
      case 'superieur':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'team', label: 'Mon Équipe', icon: Users },
          { id: 'profile', label: 'Mon Profil', icon: User }
        ];
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'profile', label: 'Mon Profil', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrateur': return 'Administrateur';
      case 'superieur': return 'Supérieur Hiérarchique';
      default: return 'Personnel';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrateur': return 'bg-red-100 text-red-800';
      case 'superieur': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">
                Système RH
              </span>
            </div>
            
            <div className="ml-10 flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      flex items-center space-x-2
                      ${activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.position}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;