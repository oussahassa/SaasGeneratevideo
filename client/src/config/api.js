// Configuration des endpoints API
// À utiliser avec axios

const API_BASE_URL =  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
  },
  // User endpoints
  USER: {
    GET_CREATIONS: `${API_BASE_URL}/user/get-user-creations`,
    GET_PUBLISHED: `${API_BASE_URL}/user/get-published-creations`,
    TOGGLE_LIKE: `${API_BASE_URL}/user/toggle-like-creation`,
    IMAGE_HISTORY: (page = 1, lim = 10) => `${API_BASE_URL}/user/image-history?page=${page}&lim=${lim}`,
   PUBLISH_CREATION: `${API_BASE_URL}/user/get-published-creations`,
   PLAN: `${API_BASE_URL}/user/plan`,
    PROFILE: `${API_BASE_URL}/user/profile`,
    UPGRADE_PLAN: `${API_BASE_URL}/user/upgrade-plan`,  
    DASHBOARD_STATS: `${API_BASE_URL}/user/dashboard-stats`,
    SESSIONS: `${API_BASE_URL}/user/sessions`,
    REVOKE_SESSION: `${API_BASE_URL}/user/revoke-session`,


  },

  // AI endpoints
  AI: {
    GENERATE_ARTICLE: `${API_BASE_URL}/ai/generate-article`,
    GENERATE_BLOG_TITLE: `${API_BASE_URL}/ai/generate-blog-title`,
    GENERATE_IMAGE: `${API_BASE_URL}/ai/generate-image`,
    REMOVE_BACKGROUND: `${API_BASE_URL}/ai/remove-image-background`,
    REMOVE_OBJECT: `${API_BASE_URL}/ai/remove-image-object`,
  },

  // Pack endpoints
  PACKS: {
    GET_ALL: `${API_BASE_URL}/packs/get-all-packs`,
    GET_BY_ID: (id) => `${API_BASE_URL}/packs/get-pack/${id}`,
    CREATE: `${API_BASE_URL}/packs/create-pack`,
    UPDATE: (id) => `${API_BASE_URL}/packs/update-pack/${id}`,
    DELETE: (id) => `${API_BASE_URL}/packs/delete-pack/${id}`,
  },

  // Video endpoints
  VIDEOS: {
    GENERATE_SCRIPT: `${API_BASE_URL}/videos/generate-video`,
    GENERATE_FROM_ASSETS: `${API_BASE_URL}/videos/generate-from-assets`,
    SHARE_TO_SOCIAL: `${API_BASE_URL}/videos/share-to-social`,
    GET_VIDEOS: `${API_BASE_URL}/videos/get-videos`,
    GET_STATS: `${API_BASE_URL}/videos/get-stats`,
    DELETE: (id) => `${API_BASE_URL}/videos/delete-video/${id}`,
  },

  // Support endpoints
  SUPPORT: {
    GET_FAQS: `${API_BASE_URL}/support/get-faqs`,
    CREATE_FAQ: `${API_BASE_URL}/support/create-faq`,
    UPDATE_FAQ: (id) => `${API_BASE_URL}/support/update-faq/${id}`,
    DELETE_FAQ: (id) => `${API_BASE_URL}/support/delete-faq/${id}`,
    CREATE_COMPLAINT: `${API_BASE_URL}/support/create-complaint`,
    GET_MY_COMPLAINTS: `${API_BASE_URL}/support/get-my-complaints`,
    GET_ALL_COMPLAINTS: `${API_BASE_URL}/support/get-all-complaints`,
    UPDATE_COMPLAINT: (id) => `${API_BASE_URL}/support/update-complaint/${id}`,
    DELETE_COMPLAINT: (id) => `${API_BASE_URL}/support/delete-complaint/${id}`,
    GET_COMPLAINTS_STATS: `${API_BASE_URL}/support/complaints-stats`,
  },

  // Admin endpoints
  ADMIN: {
    GET_DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard-stats`,
    GET_ALL_USERS: `${API_BASE_URL}/admin/get-all-users`,
    GET_USER: (id) => `${API_BASE_URL}/admin/get-user/${id}`,
    TOGGLE_USER_STATUS: (id) => `${API_BASE_URL}/admin/toggle-user-status/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/admin/delete-user/${id}`,
    GET_DAILY_STATS: `${API_BASE_URL}/admin/daily-stats`,
    GET_FEATURE_USAGE_STATS: `${API_BASE_URL}/admin/feature-usage-stats`,
  },
};

// Configuration Axios par défaut
export const axiosConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Fonction utilitaire pour gérer les erreurs API
export const handleApiError = (error) => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Une erreur s\'est produite',
      data: error.response.data,
    };
  } else if (error.request) {
    // La requête a été effectuée mais pas de réponse
    return {
      status: null,
      message: 'Pas de réponse du serveur',
      data: null,
    };
  } else {
    // Erreur lors de la configuration de la requête
    return {
      status: null,
      message: error.message || 'Erreur lors de la requête',
      data: null,
    };
  }
};

// Fonction utilitaire pour les requêtes API avec gestion d'erreur
export const makeApiRequest = async (axios, method, url, data = null, config = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
      status: error.response?.status,
    };
  }
};
