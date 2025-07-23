// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// Les hooks React communiquent via l'API REST, indépendamment de la base de données

import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { Employee } from '../types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createEmployee = async (employeeData: any) => {
    try {
      await apiClient.createEmployee(employeeData);
      await fetchEmployees(); // Recharger la liste
    } catch (error) {
      throw error;
    }
  };

  const updateEmployee = async (id: number, employeeData: any) => {
    try {
      await apiClient.updateEmployee(id, employeeData);
      await fetchEmployees(); // Recharger la liste
    } catch (error) {
      throw error;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await apiClient.deleteEmployee(id);
      await fetchEmployees(); // Recharger la liste
    } catch (error) {
      throw error;
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};