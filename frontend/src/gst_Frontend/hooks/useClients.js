import { useCallback, useEffect, useState } from "react";
import { clientsApi } from "@/gst_Frontend/api/clientsApi";
import { ENTITY_ENDPOINTS } from "@/gst_Frontend/config/entityEndpoints";

export function useClients(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = useCallback(async () => {
    if (!endpoint) return;

    try {
      setLoading(true);
      setError("");

      // ALL RECORDS
      if (endpoint === "ALL") {
        const endpoints = Object.values(ENTITY_ENDPOINTS).filter(
          value => value !== "ALL"
        );

        const results = await Promise.all(
          endpoints.map(ep => clientsApi.getAll(ep))
        );

        const merged = results.flat();

        console.log("ALL DATA:", merged);

        setData(merged);
        return;
      }

      // SINGLE ENTITY
      const clients = await clientsApi.getAll(endpoint);

      console.log("ENDPOINT:", endpoint);
      console.log("CLIENTS:", clients);

      setData(Array.isArray(clients) ? clients : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load clients."
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function createClient(payload) {
    setSaving(true);

    try {
      const created = await clientsApi.create(
        endpoint,
        payload
      );

      setData(prev => [...prev, created]);

      return created;
    } finally {
      setSaving(false);
    }
  }

// In useClients.js - this looks correct already
// In useClients.js - make sure updateClient is working correctly
async function updateClient(id, payload) {
  setSaving(true);
  try {
    const updated = await clientsApi.update(endpoint, id, payload);
    console.log("UpdateClient response:", updated);
    
    // Update the local state immediately
    setData(prev => {
      const newData = prev.map(client => 
        client.id === updated.id ? { ...client, ...updated } : client
      );
      console.log("Updated data:", newData);
      return newData;
    });
    
    return updated;
  } catch (err) {
    console.error("Update error:", err);
    throw err;
  } finally {
    setSaving(false);
  }
}

// In useClients.js - Add this function
async function updateClientWithEndpoint(customEndpoint, id, payload) {
  setSaving(true);
  try {
    const updated = await clientsApi.update(customEndpoint, id, payload);
    
    // Only update local state if the custom endpoint matches current endpoint
    if (customEndpoint === endpoint) {
      setData(prev => prev.map(client => 
        client.id === updated.id ? updated : client
      ));
    }
    
    return updated;
  } catch (err) {
    console.error("Update error:", err);
    throw err;
  } finally {
    setSaving(false);
  }
}

// Return this as well
return {
  data,
  loading,
  saving,
  error,
  refetch: fetchClients,
  createClient,
  updateClient,
  updateClientWithEndpoint, // Add this
  deleteClient,
};

  async function deleteClient(id) {
    setSaving(true);

    try {
      await clientsApi.remove(
        endpoint,
        id
      );

      setData(prev =>
        prev.filter(client => client.id !== id)
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    data,
    loading,
    saving,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}