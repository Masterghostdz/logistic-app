import L from 'leaflet';
import { Warehouse, Chauffeur } from '../../types';
import { warehouseIcon, chauffeurIcon, desktopWarehouseIcon, desktopChauffeurIcon, chauffeurIconHighlighted } from './MapIcons';

interface CreateMarkersOptions {
  warehouses: Warehouse[];
  chauffeurs: Chauffeur[];
  map: L.Map;
  t: (key: string) => string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
  isMobile?: boolean;
  highlightedWarehouseId?: string | null;
  highlightedChauffeurId?: string | null;
}

// Cache pour éviter la recréation des marqueurs
const markerCache = new Map<string, L.Marker>();

const createGoogleMapsLink = (lat: number, lng: number, name: string) => {
  const encodedName = encodeURIComponent(name);
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`;
};

export const createMarkers = ({
  warehouses,
  chauffeurs,
  map,
  t,
  onWarehouseClick,
  onChauffeurClick,
  isMobile = false,
  highlightedWarehouseId,
  highlightedChauffeurId
}: CreateMarkersOptions): L.Marker[] => {
  console.log('createMarkers chauffeurs:', chauffeurs);
  const markers: L.Marker[] = [];
  const currentMarkerIds = new Set<string>();

  // Choose appropriate icons based on mobile/desktop
  const warehouseIconToUse = isMobile ? warehouseIcon : desktopWarehouseIcon;
  const chauffeurIconToUse = isMobile ? chauffeurIcon : desktopChauffeurIcon;

  // Popup styling based on mobile/desktop
  const popupPadding = isMobile ? '12px' : '12px';
  const popupMinWidth = isMobile ? '280px' : '200px';
  const popupMaxWidth = isMobile ? '320px' : '250px';
  const popupFontSize = isMobile ? '14px' : '14px';
  const popupTitleSize = isMobile ? '16px' : '16px';
  const popupMargin = isMobile ? '8px' : '8px';
  const popupLineMargin = isMobile ? '6px' : '4px';

  // Add warehouse markers
  warehouses.forEach(warehouse => {
    const markerId = `warehouse-${warehouse.id}`;
    currentMarkerIds.add(markerId);
    
    let marker = markerCache.get(markerId);
    // Icône animée si highlighted
    let iconToUse = warehouseIconToUse;
    if (highlightedWarehouseId && warehouse.id === highlightedWarehouseId) {
      iconToUse = L.divIcon({
        html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:${isMobile ? 56 : 49}px;height:${isMobile ? 56 : 49}px;">
          <span class='warehouse-glow'></span>
          <svg width="${isMobile ? 44 : 38}" height="${isMobile ? 44 : 38}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="z-index:2;">
            <polygon class="warehouse-polygon-anim" points="24,8 8,22 12,22 12,36 36,36 36,22 40,22" fill="#2563eb"/>
            <rect x="18" y="28" width="6" height="8" rx="1.5" fill="white" fill-opacity="0"/>
            <rect x="26" y="28" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
            <rect x="18" y="24" width="4" height="4" rx="1" fill="white" fill-opacity="0"/>
          </svg>
          <style>
          .warehouse-glow {
            position: absolute;
            left: 50%;
            top: 50%;
            width: ${isMobile ? 60 : 54}px;
            height: ${isMobile ? 60 : 54}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, #2563eb 0%, #60a5fa 60%, #dbeafe 100%);
            filter: blur(2px);
            opacity: 0;
            z-index: 1;
            animation: warehouse-glow-blink 1.2s infinite;
          }
          .warehouse-polygon-anim {
            animation: warehouse-polygon-blink 1.2s infinite;
          }
          @keyframes warehouse-glow-blink {
            0% { opacity: 0; filter: blur(2px); }
            40% { opacity: 0; filter: blur(2px); }
            50% { opacity: 0.7; filter: blur(10px); }
            100% { opacity: 0.7; filter: blur(10px); }
          }
          @keyframes warehouse-polygon-blink {
            0% { fill: #2563eb; }
            40% { fill: #2563eb; }
            50% { fill: #e0edfa; }
            100% { fill: #e0edfa; }
          }
          </style>
        </div>`,
        className: 'custom-div-icon',
        iconSize: [isMobile ? 56 : 49, isMobile ? 56 : 49],
        iconAnchor: [isMobile ? 28 : 24.5, isMobile ? 28 : 24.5]
      });
    }
    if (!marker) {
      marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng], {
        icon: iconToUse
      });

      const googleMapsUrl = createGoogleMapsLink(
        warehouse.coordinates.lat,
        warehouse.coordinates.lng,
        warehouse.name
      );

      // Create popup content with Google Maps link
      const popupContent = `
        <div style="padding: ${popupPadding}; min-width: ${popupMinWidth}; max-width: ${popupMaxWidth}; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <h3 style="font-weight: 600; font-size: ${popupTitleSize}; margin-bottom: ${popupMargin}; color: #1f2937; word-wrap: break-word;">${warehouse.name}</h3>
          <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin}; word-wrap: break-word;"><strong>${t('warehouses.company')}:</strong> ${warehouse.companyName}</p>
          <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupLineMargin}; word-wrap: break-word;"><strong>${t('warehouses.address')}:</strong> ${warehouse.address}</p>
          <p style="font-size: ${popupFontSize}; color: #6b7280; margin-bottom: ${popupMargin}; word-wrap: break-word;"><strong>${t('warehouses.phone')}:</strong> ${warehouse.phone.join(', ')}</p>
          <a href="${googleMapsUrl}" target="_blank" style="display: inline-block; background: #4285f4; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: ${popupFontSize}; font-weight: 500; margin-top: 4px;">📍 Ouvrir dans Google Maps</a>
        </div>
      `;

      // Bind popup with proper configuration
      marker.bindPopup(popupContent, {
        maxWidth: isMobile ? 320 : 250,
        closeButton: true,
        autoClose: false,
        autoPan: true,
        offset: [0, -10],
        className: 'custom-popup'
      });

      // Add click event handler
      marker.on('click', () => {
        marker.openPopup();
        if (onWarehouseClick) {
          onWarehouseClick(warehouse);
        }
      });

      // Cache the marker
      markerCache.set(markerId, marker);
    } else {
      marker.setIcon(iconToUse);
    }

    // Only add to map if not already added
    if (!map.hasLayer(marker)) {
      marker.addTo(map);
    }
    
    markers.push(marker);
  });

  // Add chauffeur markers
  chauffeurs.forEach(chauffeur => {
    if (chauffeur.coordinates) {
      const markerId = `chauffeur-${chauffeur.id}`;
      currentMarkerIds.add(markerId);
      let marker = markerCache.get(markerId);
      // Utilise l'icône animée si le chauffeur est sélectionné
      let iconToUse = chauffeurIconToUse;
      if (highlightedChauffeurId && String(chauffeur.id) === String(highlightedChauffeurId)) {
        iconToUse = chauffeurIconHighlighted;
      }
      if (!marker) {
        const displayName = chauffeur.employeeType === 'externe' 
          ? `TP - ${chauffeur.fullName}` 
          : chauffeur.fullName;

        marker = L.marker([chauffeur.coordinates.lat, chauffeur.coordinates.lng], {
          icon: iconToUse
        });

        // Use attached declaration for program reference
        let programRef = '';
        if (chauffeur.declaration && chauffeur.declaration.year && chauffeur.declaration.month && chauffeur.declaration.programNumber) {
          programRef = `DCP/${chauffeur.declaration.year}/${chauffeur.declaration.month}/${chauffeur.declaration.programNumber}`;
        }

        const popupContent = `
          <div style="padding: ${popupPadding}; min-width: ${popupMinWidth}; max-width: ${popupMaxWidth}; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; font-family: 'Segoe UI', 'Arial', sans-serif; font-size: 13px; line-height: 1.1;">
            <h3 style="font-family: 'Segoe UI', 'Arial', sans-serif; font-weight: 900; font-size: 16px; margin-bottom: 10px; color: #2563eb; word-wrap: break-word;">${displayName}</h3>
            <div style="font-size: 15px; color: #111; margin-bottom: 2px; word-wrap: break-word; font-weight: bold;"><strong>Programme:</strong> <strong>${programRef || '<span style=\'color:#b91c1c\'>Aucune référence</span>'}</strong></div>
            <p style="font-size: 13px; color: #111; margin-bottom: 2px; word-wrap: break-word;"><strong>${t('chauffeurs.employeeType')}:</strong> ${chauffeur.employeeType}</p>
            <p style="font-size: 13px; color: #111; margin-bottom: 2px; word-wrap: break-word;"><strong>${t('chauffeurs.vehicleType')}:</strong> ${chauffeur.vehicleType}</p>
            <p style="font-size: 13px; color: #111; word-wrap: break-word;"><strong>${t('chauffeurs.phone')}:</strong> ${chauffeur.phone.join(', ')}</p>
          </div>
        `;

        // Bind popup with proper configuration
        marker.bindPopup(popupContent, {
          maxWidth: isMobile ? 320 : 250,
          closeButton: true,
          autoClose: false,
          autoPan: true,
          offset: [0, -10],
          className: 'custom-popup'
        });

        // Add click event handler  
        marker.on('click', () => {
          marker.openPopup();
          if (onChauffeurClick) {
            onChauffeurClick(chauffeur);
          }
        });

        // Cache the marker
        markerCache.set(markerId, marker);
      } else {
        marker.setIcon(iconToUse);
      }

      // Only add to map if not already added
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
      
      markers.push(marker);
    }
  });

  // Remove markers that are no longer needed
  markerCache.forEach((marker, markerId) => {
    if (!currentMarkerIds.has(markerId)) {
      map.removeLayer(marker);
      markerCache.delete(markerId);
    }
  });

  return markers;
};

export const fitMapToMarkers = (map: L.Map, markers: L.Marker[], forceRefresh = false) => {
  if (markers.length > 0 && forceRefresh) {
    const group = L.featureGroup(markers);
    const bounds = group.getBounds();
    
    // Add padding and ensure minimum zoom level
    map.fitBounds(bounds, {
      padding: [20, 20],
      maxZoom: 15
    });
  } else if (markers.length > 0) {
    // Only fit if the map hasn't been manually interacted with
    const currentZoom = map.getZoom();
    const defaultZoom = 6;
    
    if (Math.abs(currentZoom - defaultZoom) < 1) {
      const group = L.featureGroup(markers);
      const bounds = group.getBounds();
      
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 15
      });
    }
  } else {
    // Default view if no markers
    map.setView([28.0339, 1.6596], 6);
  }
};
