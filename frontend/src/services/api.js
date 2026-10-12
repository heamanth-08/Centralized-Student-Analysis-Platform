const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('campusiq_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.isFormData
    ? { ...(localStorage.getItem('campusiq_token') ? { Authorization: `Bearer ${localStorage.getItem('campusiq_token')}` } : {}) }
    : { ...getAuthHeaders(), ...options.headers };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('campusiq_token');
      localStorage.removeItem('campusiq_user');
      window.dispatchEvent(new Event('campusiq_auth_logout'));
    }

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (e) {
        errData = { error: { message: response.statusText } };
      }
      throw new Error(errData?.error?.message || errData?.detail || 'Request failed');
    }

    // Handle blob downloads
    if (options.responseType === 'blob') {
      return await response.blob();
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  auth: {
    login: (username, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  students: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/students?${q}`);
    },
    get: (id) => request(`/students/${id}`),
    create: (data) =>
      request('/students', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id, status) =>
      request(`/students/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  analytics: {
    getDashboard: () => request('/analytics/dashboard'),
    getAcademic: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/analytics/academic?${q}`);
    },
    getAttendance: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/analytics/attendance?${q}`);
    },
    getDepartments: () => request('/analytics/departments'),
  },

  stride: {
    getActivities: () => request('/stride/activities'),
    createActivity: (data) =>
      request('/stride/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getTransactions: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/stride/transactions?${q}`);
    },
    awardPoints: (data) =>
      request('/stride/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    reverseTransaction: (id, reason) =>
      request(`/stride/transactions/${id}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    getStudentSummary: (studentId) => request(`/stride/students/${studentId}`),
  },

  support: {
    getFlags: () => request('/support/flags'),
    createIntervention: (data) =>
      request('/support/interventions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateIntervention: (id, data) =>
      request(`/support/interventions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  departments: {
    list: () => request('/departments'),
    create: (data) =>
      request('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listCourses: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/courses?${q}`);
    },
    createCourse: (data) =>
      request('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  imports: {
    upload: (formData) =>
      request('/imports', {
        method: 'POST',
        body: formData,
        isFormData: true,
      }),
    list: () => request('/imports'),
    getTemplate: (type) => `/api/imports/templates/${type}`,
  },

  reports: {
    downloadStudentsUrl: '/api/reports/students',
    downloadAttendanceUrl: '/api/reports/attendance',
    downloadStrideUrl: '/api/reports/stride',
  },

  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  },

  users: {
    list: () => request('/users'),
    create: (data) =>
      request('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  settings: {
    get: () => request('/settings'),
    update: (key, value) =>
      request(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }),
  },
};
