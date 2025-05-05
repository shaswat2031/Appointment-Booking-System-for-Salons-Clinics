const API_BASE_URL =
  "https://appointment-booking-system-for-salons-br4o.onrender.com";

// Generic function for API calls
async function callApi(endpoint, method = "GET", data = null) {
  const url = `${API_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

// API methods
const apiService = {
  // User endpoints
  getUsers: () => callApi("/api/users"),
  getUserById: (id) => callApi(`/api/users/${id}`),
  createUser: (userData) => callApi("/api/users", "POST", userData),
  updateUser: (id, userData) => callApi(`/api/users/${id}`, "PUT", userData),
  deleteUser: (id) => callApi(`/api/users/${id}`, "DELETE"),

  // Authentication
  login: (credentials) => callApi("/api/auth/login", "POST", credentials),
  register: (userData) => callApi("/api/auth/register", "POST", userData),

  // Appointments
  getAppointments: () => callApi("/api/appointments"),
  getAppointmentById: (id) => callApi(`/api/appointments/${id}`),
  createAppointment: (appointmentData) =>
    callApi("/api/appointments", "POST", appointmentData),
  updateAppointment: (id, appointmentData) =>
    callApi(`/api/appointments/${id}`, "PUT", appointmentData),
  deleteAppointment: (id) => callApi(`/api/appointments/${id}`, "DELETE"),

  // Services
  getServices: () => callApi("/api/services"),
  getServiceById: (id) => callApi(`/api/services/${id}`),

  // Add more endpoints as needed
};

module.exports = apiService;
