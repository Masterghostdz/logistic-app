
import L from 'leaflet';
import { Warehouse, Chauffeur } from '../../types';
import { warehouseIcon, chauffeurIcon, desktopWarehouseIcon, desktopChauffeurIcon } from './MapIcons';

interface CreateMarkersOptions {
  warehouses: Warehouse[];
  chauffeurs: Chauffeur[];
  map: L.Map;
  t: (key: string) => string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
  isMobile?: boolean;
}

export const createMarkers = ({
  warehouses,
  chauffeurs,
  map,
  t,
  onWarehouseClick,
  onChauffeurClick,
  isMobile = false
}: CreateMarkersOptions): L.Marker[] => {
  const markers: L.Marker[] = [];

  // Choose appropriate icons based on mobile/desktop
  const warehouseIconToUse = isMobile ? warehouseIcon : desktopWarehouseIcon;
  const chauffeurIconToUse = isMobile ? chauffeurIcon : desktopChauffeurIcon;

  // Popup styling based on mobile/desktop
  const popupPadding = isMobile ? '16px' : '12px';
  const popupMinWidth = isMobile ? '250px' : '200px';
  const popupFontSize = isMobile ? '16px' : '14px';
  const popupTitleSize = isMobile ? '18px' : '16px';
  const popupMargin = isMobile ? '12px' : '8px';
  const popupLineMargin = isMobile ? '8px' : '4px';

  // Add warehouse markers
  warehouses.forEach(warehouse => {
    const marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng], {
      icon: warehouseIconToUse
    })
      .addTo(map);

    // Create popup content
    const popupContent = `
      <div style="padding: ${popupPadding}; min-width: ${popupMinWidth}; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="font-weight: 600; font-size: ${popupTitleSize}; margin-bottom: ${popupMargin}; color: #1f2937;">${warehouse.name}</h3>
        <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin};"><strong>${t('warehouses.company')}:</strong> ${warehouse.companyName}</p>
        <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin};"><strong>${t('warehouses.address')}:</strong> ${warehouse.address}</p>
        <p style="font-size: ${popupFontSize}; color: #6b7280;"><strong>${t('warehouses.phone')}:</strong> ${warehouse.phone.join(', ')}</p>
      </div>
    `;

    // Bind popup with proper configuration
    marker.bindPopup(popupContent, {
      maxWidth: isMobile ? 300 : 250,
      closeButton: true,
      autoClose: false,
      autoPan: true,
      offset: [0, -10]
    });

    // Add click event handler
    marker.on('click', () => {
      // Open popup programmatically to ensure it shows
      marker.openPopup();
      
      // Call custom click handler if provided
      if (onWarehouseClick) {
        onWarehouseClick(warehouse);
      }
    });

    markers.push(marker);
  });

  // Add chauffeur markers
  chauffeurs.forEach(chauffeur => {
    if (chauffeur.coordinates) {
      const displayName = chauffeur.employeeType === 'externe' 
        ? `TP - ${chauffeur.fullName}` 
        : chauffeur.fullName;

      const marker = L.marker([chauffeur.coordinates.lat, chauffeur.coordinates.lng], {
        icon: chauffeurIconToUse
      })
        .addTo(map);

      // Create popup content
      const popupContent = `
        <div style="padding: ${popupPadding}; min-width: ${popupMinWidth}; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="font-weight: 600; font-size: ${popupTitleSize}; margin-bottom: ${popupMargin}; color: #1f2937;">${displayName}</h3>
          <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin};"><strong>${t('chauffeurs.employeeType')}:</strong> ${chauffeur.employeeType}</p>
          <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin};"><strong>${t('chauffeurs.vehicleType')}:</strong> ${chauffeur.vehicleType}</p>
          <p style="font-size: ${popupFontSize}; color: #6b7280;"><strong>${t('chauffeurs.phone')}:</strong> ${chauffeur.phone.join(', ')}</p>
        </div>
      `;

      // Bind popup with proper configuration
      marker.bindPopup(popupContent, {
        maxWidth: isMobile ? 300 : 250,
        closeButton: true,
        autoClose: false,
        autoPan: true,
        offset: [0, -10]
      });

      // Add click event handler
      marker.on('click', () => {
        // Open popup programmatically to ensure it shows
        marker.openPopup();
        
        // Call custom click handler if provided
        if (onChauffeurClick) {
          onChauffeurClick(chauffeur);
        }
      });

      markers.push(marker);
    }
  });

  return markers;
};

export const fitMapToMarkers = (map: L.Map, markers: L.Marker[]) => {
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
};
