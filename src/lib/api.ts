// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// L'API client communique avec le serveur via HTTP, indépendamment de la base de données

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private getHeaders() {
    const token = localStorage.getItem('hr_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      hasToken: !!localStorage.getItem('hr_token')
    });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(error.error || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Employees
  async getEmployees() {
    return this.request('/employees');
  }

  async createEmployee(employeeData: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id: number, employeeData: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id: number) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async getManagers() {
    return this.request('/employees/managers');
  }
}

export const apiClient = new ApiClient();