# Ocean PFZ & Safety Advisor

An AI-assisted Geospatial Decision Support System for artisanal and commercial fishermen. Provides real-time Potential Fishing Zone (PFZ) intelligence, sea surface temperature (SST) gradients, chlorophyll-a upwelling data, and sea safety risk advisories.

## Architecture

- **`frontend/`**: React 18 + Vite + Leaflet mapping client.
  - Interactive chat interface for querying ocean advisory agents.
  - Dynamic GeoJSON layer visualization for PFZ polygons, thermal contours, and coastline.
  - Connects to `POST http://localhost:8000/chat`.
- **`backend/`**: FastAPI service (M1–M3 pipeline).
  - Conversation agent + Planner + Ocean/Weather agents.
  - Geospatial layer server: `GET /layers/{layer_id}/{date}.geojson`.
- **`docs/`**: API Schema contract documentation.

## Running the Frontend (M4)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Running the Backend (M1-M3)

```bash
cd backend
python -m uvicorn mock_server:app --port 8000 --reload
```
