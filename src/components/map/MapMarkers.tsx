
import L from 'leaflet';
import { Warehouse, Chauffeur } from '../../types';
import { warehouseIcon, chauffeurIcon } from './MapIcons';

interface CreateMarkersOptions {
  warehouses: Warehouse[];
  chauffeurs: Chauffeur[];
  map: L.Map;
  t: (key: string) => string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
}

export const createMarkers = ({
  warehouses,
  chauffeurs,
  map,
  t,
  onWarehouseClick,
  onChauffeurClick
}: CreateMarkersOptions): L.Marker[] => {
  const markers: L.Marker[] = [];

  // Add warehouse markers
  warehouses.forEach(warehouse => {
    const marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng], {
      icon: warehouseIcon
    })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 16px; min-width: 250px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1f2937;">${warehouse.name}</h3>
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 8px;"><strong>${t('warehouses.company')}:</strong> ${warehouse.companyName}</p>
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 8px;"><strong>${t('warehouses.address')}:</strong> ${warehouse.address}</p>
          <p style="font-size: 16px; color: #6b7280;"><strong>${t('warehouses.phone')}:</strong> ${warehouse.phone}</p>
        </div>
      `, {
        maxWidth: 300,
        closeButton: true,
        autoClose: false
      });

    if (onWarehouseClick) {
      marker.on('click', () => onWarehouseClick(warehouse));
    }

    markers.push(marker);
  });

  // Add chauffeur markers
  chauffeurs.forEach(chauffeur => {
    if (chauffeur.coordinates) {
      const displayName = chauffeur.employeeType === 'externe' 
        ? `TP - ${chauffeur.fullName}` 
        : chauffeur.fullName;

      const marker = L.marker([chauffeur.coordinates.lat, chauffeur.coordinates.lng], {
        icon: chauffeurIcon
      })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 16px; min-width: 250px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 12px; color: #1f2937;">${displayName}</h3>
            <p style="font-size: 16px; color: #6b7280; margin-bottom: 8px;"><strong>${t('chauffeurs.employeeType')}:</strong> ${chauffeur.employeeType}</p>
            <p style="font-size: 16px; color: #6b7280; margin-bottom: 8px;"><strong>${t('chauffeurs.vehicleType')}:</strong> ${chauffeur.vehicleType}</p>
            <p style="font-size: 16px; color: #6b7280;"><strong>${t('chauffeurs.phone')}:</strong> ${chauffeur.phone}</p>
          </div>
        `, {
          maxWidth: 300,
          closeButton: true,
          autoClose: false
        });

      if (onChauffeurClick) {
        marker.on('click', () => onChauffeurClick(chauffeur));
      }

      markers.push(marker);
    }
  });

  return markers;
};

export const fitMapToMarkers = (map: L.Map, markers: L.Marker[]) => {
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  }
};
