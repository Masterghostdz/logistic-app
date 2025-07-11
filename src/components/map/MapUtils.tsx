
import L from 'leaflet';

export const createMap = (container: HTMLDivElement): L.Map => {
  const map = L.map(container, {
    center: [28.0339, 1.6596],
    zoom: 6,
    zoomControl: false,
    attributionControl: false,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: false,
    keyboard: false
  });

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  return map;
};

export const resetMapView = (map: L.Map, markers: L.Marker[]) => {
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  } else {
    map.setView([28.0339, 1.6596], 6);
  }
};
