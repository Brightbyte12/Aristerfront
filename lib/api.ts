import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://arister.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This will send cookies automatically
});


export const getProductById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    cache: 'no-store', // Always fetch fresh data
  });
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
};

export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

// Fetch all products
// export const getAllProducts = async () => {
//   const response = await api.get('/products');
//   return response.data;
// };

// Fetch product by ID
// export const getProductById = async (id: string) => {
//   const response = await api.get(`/products/${id}`);
//   return response.data;
// };

// Fetch all categories
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const updateProductFeaturedStatus = async (id: string, isFeatured: boolean) => {
  const response = await api.patch(`/products/${id}`, { isFeatured });
  return response.data;
};

// Review API functions
export const getProductReviews = async (productId: string, page = 1, limit = 10, sort = 'newest') => {
  const response = await api.get(`/reviews/product/${productId}`, {
    params: { page, limit, sort }
  });
  return response.data;
};

export const checkCanReview = async (productId: string) => {
  const response = await api.get(`/reviews/can-review/${productId}`);
  return response.data;
};

export const createReview = async (reviewData: {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  size?: string;
}) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (reviewId: string, reviewData: {
  rating?: number;
  title?: string;
  comment?: string;
  size?: string;
}) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const markReviewHelpful = async (reviewId: string) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};

// Debug function to check user orders
export const debugUserOrders = async (userId: string) => {
  const response = await api.get(`/reviews/debug/orders/${userId}`);
  return response.data;
};

// Replacement API functions
export const checkReplacementEligibility = async (orderId: string) => {
  const response = await api.get(`/replacements/check-eligibility/${orderId}`);
  return response.data;
};

export const requestReplacement = async (orderId: string, reason: string) => {
  const response = await api.post(`/replacements/request/${orderId}`, { reason });
  return response.data;
};

export const getMyReplacements = async () => {
  const response = await api.get('/replacements/my-replacements');
  return response.data;
};

export const cancelReplacementRequest = async (orderId: string) => {
  const response = await api.post(`/replacements/cancel/${orderId}`);
  return response.data;
};

// Admin replacement management API functions
export const approveReplacement = async (orderId: string, adminNotes?: string) => {
  const response = await api.post(`/replacements/admin/approve/${orderId}`, { adminNotes });
  return response.data;
};

export const rejectReplacement = async (orderId: string, rejectionReason: string, adminNotes?: string) => {
  const response = await api.post(`/replacements/admin/reject/${orderId}`, { rejectionReason, adminNotes });
  return response.data;
};

export const getAllReplacementRequests = async () => {
  const response = await api.get('/replacements/admin/all');
  return response.data;
};

export const completeReplacement = async (orderId: string, adminNotes?: string) => {
  const response = await api.post(`/replacements/admin/complete/${orderId}`, { adminNotes });
  return response.data;
};

export const subscribeToNewsletter = async (email: string) => {
  const response = await api.post('/newsletter', { email });
  return response.data;
};

export const getPublicSettings = async () => {
  const response = await api.get('/settings/public');
  return response.data;
};

export { API_BASE_URL };
