// clientsApi.js
import { axiosClient } from "@/gst_Frontend/api/axiosClient";

export const clientsApi = {
  getAll(endpoint) {
    return axiosClient.get(endpoint).then(res => {
      const response = res.data;
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || [];
    });
  },

  create(endpoint, data) {
    return axiosClient.post(endpoint, data).then(res => res.data.data);
  },

  update(endpoint, id, data) {
    // Remove trailing slash if any and ensure proper URL
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    const url = `${cleanEndpoint}/${id}`;
    console.log("PATCH Request URL:", url);  // Changed from PUT to PATCH
    console.log("PATCH Request Data:", data); // Changed from PUT to PATCH
    
    return axiosClient.patch(url, data)  // ← CHANGE THIS LINE: put → patch
      .then(res => {
        console.log("PATCH Response:", res.data); // Changed from PUT to PATCH
        return res.data.data;
      });
  },

  remove(endpoint, id) {
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    return axiosClient.delete(`${cleanEndpoint}/${id}`).then(res => res.data);
  },
};