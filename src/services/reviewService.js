import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get all reviews with pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Reviews data with pagination
 */
export const getAllReviews = async (params = {}) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', productId, userId, rating } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sort', sort);
    
    if (productId) queryParams.append('productId', productId);
    if (userId) queryParams.append('userId', userId);
    if (rating) queryParams.append('rating', rating);
    
    const response = await api.get(`/admin/reviews?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a single review by ID
 * @param {string} reviewId - ID of the review
 * @returns {Promise<Object>} Review data
 */
export const getReviewById = async (reviewId) => {
  try {
    const response = await api.get(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Update a review
 * @param {string} reviewId - ID of the review to update
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/admin/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Delete a review
 * @param {string} reviewId - ID of the review to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Get reviews for a specific product
 * @param {string} productId - ID of the product
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Reviews for the product
 */
export const getProductReviews = async (productId, params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/admin/reviews/product/${productId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Get reviews by a specific user
 * @param {string} userId - ID of the user
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Reviews by the user
 */
export const getUserReviews = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/admin/reviews/user/${userId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for user ${userId}:`, error);
    throw error.response?.data || error;
  }
};

export default {
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getProductReviews,
  getUserReviews
};
