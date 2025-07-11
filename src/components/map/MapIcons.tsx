
import L from 'leaflet';

// Mobile-optimized icons
export const warehouseIcon = L.divIcon({
  html: `<div style="
    background-color: rgba(0, 0, 0, 0.8); 
    color: white; 
    width: 32px; 
    height: 32px; 
    border-radius: 4px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    border: 2px solid rgba(255, 255, 255, 0.9); 
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); 
    font-size: 16px; 
    font-weight: bold;
  ">⌂</div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export const chauffeurIcon = L.divIcon({
  html: `<div style="background-color: #dc2626; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 18px;">🚛</div>`,
  className: 'custom-div-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Fix for default markers in Leaflet
export const initializeLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};
