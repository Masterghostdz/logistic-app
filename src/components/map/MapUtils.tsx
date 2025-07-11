
import L from 'leaflet';

export const createMap = (container: HTMLDivElement, options?: Partial<L.MapOptions>): L.Map => {
  const defaultOptions: L.MapOptions = {
    center: [28.0339, 1.6596],
    zoom: 6,
    zoomControl: true,
    attributionControl: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true
  };

  const map = L.map(container, { ...defaultOptions, ...options });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    minZoom: 2
  }).addTo(map);

  // Add custom CSS for popups
  const style = document.createElement('style');
  style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .custom-popup .leaflet-popup-content {
      margin: 0;
      padding: 0;
    }
    .custom-popup .leaflet-popup-tip {
      background: white;
    }
  `;
  document.head.appendChild(style);

  return map;
};

export const createSimpleMap = (container: HTMLDivElement): L.Map => {
  // For desktop version with better controls
  const map = L.map(container, {
    center: [28.0339, 1.6596],
    zoom: 6,
    zoomControl: true,
    attributionControl: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    minZoom: 2
  }).addTo(map);

  // Add custom CSS for popups
  const style = document.createElement('style');
  style.textContent = `
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .custom-popup .leaflet-popup-content {
      margin: 0;
      padding: 0;
    }
    .custom-popup .leaflet-popup-tip {
      background: white;
    }
  `;
  document.head.appendChild(style);

  return map;
};

export const resetMapView = (map: L.Map, markers: L.Marker[]) => {
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    const bounds = group.getBounds();
    
    // Fit bounds with padding and reasonable zoom
    map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 15
    });
  } else {
    map.setView([28.0339, 1.6596], 6);
  }
};
