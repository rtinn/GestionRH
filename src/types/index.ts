export interface User {
  id: number;
  email: string;
  role: 'personnel' | 'superieur' | 'administrateur';
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

export interface Employee {
  id: number;
  user_id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  position: string;
  department: string;
  hire_date?: string;
  salary?: number;
  manager_id?: number;
  manager_first_name?: string;
  manager_last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface EmployeeFormData {
  email: string;
  password?: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  hire_date: string;
  salary: string;
  manager_id: string;
}