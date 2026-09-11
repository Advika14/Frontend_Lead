# API Contract Specification

Shared request and response schema for communication between Frontend (M4) and Backend (M1, M2, M3).

## 1. Chat Endpoint: `POST /chat`

### Request Body
Content-Type: `application/json`

```json
{
  "message": "Where are the fish today near Kochi?",
  "context": {
    "location": {
      "name": "Kochi",
      "lat": 9.9312,
      "lon": 76.2673
    },
    "date": "2026-09-11"
  }
}
```

### Response Body
Content-Type: `application/json`

```json
{
  "text": "Based on satellite SST and chlorophyll fronts, high Potential Fishing Zones are active 18 km WSW of Kochi harbor.",
  "language": "en",
  "safety": {
    "status": "SAFE",
    "wave_height_m": 1.4,
    "wind_speed_knots": 11.2,
    "advice": "Normal sea conditions. Favorable for small craft operations."
  },
  "evidence": {
    "sst_range": "28.2 - 28.6°C",
    "chlorophyll": "1.35 mg/m³",
    "thermal_fronts": true,
    "reasoning": "Strong thermal gradient intersecting chlorophyll plume indicates nutrient upwelling."
  },
  "layers": [
    {
      "id": "pfz",
      "name": "Potential Fishing Zones (PFZ)",
      "url": "http://localhost:8000/layers/pfz/2026-09-11.geojson",
      "type": "geojson",
      "color": "#00e676"
    },
    {
      "id": "sst",
      "name": "Sea Surface Temperature Contours",
      "url": "http://localhost:8000/layers/sst/2026-09-11.geojson",
      "type": "geojson",
      "color": "#ff5722"
    }
  ]
}
```

*Note: The frontend supports `layers` returning either an array of objects `[{"id": "...", "url": "..."}]` or an array of strings `["pfz", "sst"]`.*

## 2. Geospatial Layer Endpoint: `GET /layers/{layer_id}/{date}.geojson`

Returns a standard RFC 7946 GeoJSON FeatureCollection.
Valid layer IDs: `"pfz"`, `"sst"`, `"chlorophyll"`, `"boundaries"`.
