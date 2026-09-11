import { generateMockChatResponse } from "./mockData";

const BACKEND_URL = "http://localhost:8000";

/**
 * Send a message to the /chat endpoint.
 * Conforms strictly to M4/M1 API contract.
 * Automatically falls back to mock if backend is offline.
 */
export async function sendMessage(message, context = {}) {
  const defaultContext = {
    location: {
      name: "Kochi",
      lat: 9.9312,
      lon: 76.2673
    },
    date: new Date().toISOString().split("T")[0],
    ...context
  };

  const payload = {
    message,
    context: defaultContext
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      ...normalizeResponse(data, defaultContext),
      isMock: false
    };
  } catch (err) {
    console.warn("Backend on :8000 unavailable, using schema-compliant local mock:", err.message);
    // Simulate slight natural network latency
    await new Promise(res => setTimeout(res, 450));
    const mockData = generateMockChatResponse(message, defaultContext);
    return {
      ...mockData,
      isMock: true,
      mockReason: `Backend not reached (${err.message}). Using local contract mock.`
    };
  }
}

/**
 * Fetch GeoJSON layer by layer_id and date
 */
export async function fetchLayerGeoJson(layerId, date = "2026-09-11") {
  // First try backend endpoint: GET /layers/{layer_id}/{date}.geojson
  try {
    const res = await fetch(`${BACKEND_URL}/layers/${layerId}/${date}.geojson`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore and fall back to local public asset
  }

  // Fallback to local static geojson file
  const localUrls = [
    `/data/${layerId}_kochi_${date}.geojson`,
    `/data/${layerId}_kochi_2026-09-11.geojson`,
    `/data/kerala_${layerId}.geojson`
  ];

  for (const url of localUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // try next
    }
  }

  throw new Error(`Could not load GeoJSON for layer: ${layerId}`);
}

/**
 * Ensures layers array has normalized objects with id, name, and url
 */
function normalizeResponse(data, context) {
  const date = context.date || "2026-09-11";
  let layers = data.layers || [];

  // If layers is an array of strings e.g. ["pfz", "sst"]
  layers = layers.map(layer => {
    if (typeof layer === "string") {
      return {
        id: layer,
        name: layer.toUpperCase(),
        url: `${BACKEND_URL}/layers/${layer}/${date}.geojson`,
        fallbackUrl: `/data/${layer}_kochi_${date}.geojson`,
        color: layer === "pfz" ? "#00e676" : layer === "sst" ? "#ff7043" : "#26a69a"
      };
    }
    return {
      color: layer.id === "pfz" ? "#00e676" : layer.id === "sst" ? "#ff7043" : "#26a69a",
      fallbackUrl: `/data/${layer.id}_kochi_${date}.geojson`,
      ...layer
    };
  });

  return {
    ...data,
    layers
  };
}
