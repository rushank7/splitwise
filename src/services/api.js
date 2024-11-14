const API_BASE_URL = 'http://localhost:3001/api';

let authToken = localStorage.getItem('token');

const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('token', token);
};

const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('token');
};

export const api = {
  // Auth
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async logout() {
    clearAuthToken();
  },

  // Groups
  async createGroup(groupData) {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(groupData),
    });
    return response.json();
  },

  async getGroups() {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  async getGroupDetails(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  // Expenses
  async createExpense(expenseData) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(expenseData),
    });
    return response.json();
  },

  async getExpenses(groupId) {
    const url = groupId 
      ? `${API_BASE_URL}/expenses?groupId=${groupId}`
      : `${API_BASE_URL}/expenses`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  // Balances
  async getGroupBalances(groupId) {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/balances`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  async getUserBalances() {
    const response = await fetch(`${API_BASE_URL}/balances`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  // Settlements
  async createSettlement(settlementData) {
    const response = await fetch(`${API_BASE_URL}/settlements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(settlementData),
    });
    return response.json();
  },

  async confirmSettlement(settlementId) {
    const response = await fetch(`${API_BASE_URL}/settlements/${settlementId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  // Reports
  async getExpenseReport(groupId, dateRange) {
    const params = new URLSearchParams({
      ...(groupId && { groupId }),
      ...(dateRange && { 
        startDate: dateRange.start,
        endDate: dateRange.end
      })
    });

    const response = await fetch(`${API_BASE_URL}/reports/expenses?${params}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  async exportExpenses(groupId, format = 'csv') {
    const response = await fetch(`${API_BASE_URL}/exports/expenses?groupId=${groupId}&format=${format}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.blob();
  },

  // User Profile
  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },

  // Notifications
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  },

  async markNotificationRead(notificationId) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    });
    return response.json();
  }
}; 