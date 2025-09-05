
import L from 'leaflet';

// Desktop-optimized icons (smaller)
export const desktopWarehouseIcon = L.divIcon({
  html: `<div style="
    width: 49px;
    height: 49px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
  ">
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,8 8,22 12,22 12,36 36,36 36,22 40,22" fill="black"/>
      <rect x="18" y="28" width="6" height="8" rx="1.5" fill="white" fill-opacity="0"/>
      <rect x="26" y="28" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
      <rect x="18" y="24" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [49, 49],
  iconAnchor: [24.5, 24.5]
});

export const desktopChauffeurIcon = L.divIcon({
  html: `<div style="background-color: #dc2626; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 16px;">🚛</div>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Mobile-optimized icons (larger)
export const warehouseIcon = L.divIcon({
  html: `<div style="
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
  ">
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,8 8,22 12,22 12,36 36,36 36,22 40,22" fill="black"/>
      <rect x="18" y="28" width="6" height="8" rx="1.5" fill="white" fill-opacity="0"/>
      <rect x="26" y="28" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
      <rect x="18" y="24" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
    </svg>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [56, 56],
  iconAnchor: [28, 28]
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
