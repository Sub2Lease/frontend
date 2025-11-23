export const API_BASE = "https://sub2leasebackend-d.onrender.com";
export const IMAGE_ENDPOINTS = {
  USER: (userId: string) => `${API_BASE}/users/${userId}/uploadPFP`,
  LISTING: (listingId: string) => `${API_BASE}/listings/${listingId}/uploadImage`,
}
export const IMAGE_URL = (imageId: string) => `${API_BASE}/images/${imageId}`;