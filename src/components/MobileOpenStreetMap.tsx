
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse, Chauffeur } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { initializeLeafletIcons } from './map/MapIcons';
import { createMap, resetMapView } from './map/MapUtils';
import { createMarkers, fitMapToMarkers } from './map/MapMarkers';
import MapControls from './map/MapControls';

interface MobileOpenStreetMapProps {
  warehouses?: Warehouse[];
  chauffeurs?: Chauffeur[];
  height?: string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
  focusedWarehouseId?: string | null;
  setMapInstance?: (map: any) => void;
  layerType?: string;
  userPosition?: { lat: number; lng: number } | null;
  showListButton?: boolean;
  highlightedWarehouseId?: string | null;
}

const MobileOpenStreetMap: React.FC<MobileOpenStreetMapProps> = ({ 
  warehouses = [], 
  chauffeurs = [],
  height = '400px',
  onWarehouseClick,
  onChauffeurClick,
  focusedWarehouseId,
  setMapInstance,
  layerType = 'osm',
  userPosition,
  showListButton = true,
  highlightedWarehouseId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isInitialized = useRef(false);
  const hasUserInteracted = useRef(false);
  // Affiche le marker GPS animé si userPosition est défini
  useEffect(() => {
    if (!map.current) return;
    // Toujours retirer l'ancien marker
    if (userMarkerRef.current) {
      map.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userPosition) {
      const iconHtml = `
        <span style="position: relative; display: flex; align-items: center; justify-content: center; width: 54px; height: 54px;">
          <span class='gps-glow'></span>
          <span class='material-icons gps-animated' style='font-size: 40px; z-index: 2;'>gps_fixed</span>
        </span>
        <style>
        .gps-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 48px;
          height: 48px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,23,68,0.7) 0%, rgba(255,23,68,0.2) 60%, rgba(255,23,68,0) 100%);
          filter: blur(2px);
          opacity: 0.7;
          z-index: 1;
          animation: gps-glow-sync 1.2s infinite;
        }
        .gps-animated {
          color: #ff1744;
          opacity: 0.85;
          animation: gps-blink-sync 1.2s infinite;
        }
        @keyframes gps-blink-sync {
          0% { color: #fff; opacity: 0.7; }
          40% { color: #fff; opacity: 0.7; }
          50% { color: #ff1744; opacity: 1; }
          100% { color: #ff1744; opacity: 1; }
        }
        @keyframes gps-glow-sync {
          0% { opacity: 0.7; filter: blur(2px); }
          40% { opacity: 0.7; filter: blur(6px); }
          50% { opacity: 0; filter: blur(6px); }
          100% { opacity: 0; filter: blur(6px); }
        }
        </style>
      `;
      const icon = L.divIcon({
        className: '',
        html: iconHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      const marker = L.marker([userPosition.lat, userPosition.lng], { icon }).addTo(map.current);
      userMarkerRef.current = marker;
      // Centre la carte sur la position GPS si marker ajouté
      map.current.setView([userPosition.lat, userPosition.lng], 15, { animate: true });

      // Bind un popup par défaut pour garantir l'ouverture
      marker.bindPopup('Chargement...');

      // Ajoute un popup avec reverse geocoding, handler unique
      const handlePopup = async () => {
        marker.closePopup();
        marker.setPopupContent('Chargement...');
        marker.openPopup();
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userPosition.lat}&lon=${userPosition.lng}&format=json&accept-language=fr`);
          const data = await resp.json();
          const address = data.address || {};
          const pays = address.country || 'Inconnu';
          const wilaya = address.state || address.county || address.region || 'Inconnue';
          const commune = address.city || address.town || address.village || address.municipality || address.suburb || 'Inconnue';
          marker.setPopupContent(`
            <div style=\"padding: 12px; min-width: 200px; max-width: 320px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;\">
              <h3 style=\"font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1f2937; word-wrap: break-word;\">Position actuelle</h3>
              <p style=\"font-size: 14px; color: #6b7280; margin-bottom: 6px; word-wrap: break-word;\"><strong>Pays :</strong> ${pays}</p>
              <p style=\"font-size: 14px; color: #6b7280; margin-bottom: 6px; word-wrap: break-word;\"><strong>Wilaya :</strong> ${wilaya}</p>
              <p style=\"font-size: 14px; color: #6b7280; margin-bottom: 8px; word-wrap: break-word;\"><strong>Commune :</strong> ${commune}</p>
            </div>
          `);
          marker.openPopup();
        } catch (e) {
          marker.setPopupContent("Impossible de récupérer l'adresse.");
          marker.openPopup();
        }
      };
      marker.off('click');
      marker.on('click', handlePopup);
    }
  }, [userPosition]);

  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map with mobile-optimized settings
    map.current = L.map(mapRef.current, {
      center: [28.0339, 1.6596],
      zoom: 6,
      zoomControl: false, // We'll use custom controls
      attributionControl: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: false, // Disable for mobile
      keyboard: false, // Disable for mobile
      dragging: true
    });
    
    isInitialized.current = true;
    if (setMapInstance) setMapInstance(map.current);

    // Track user interaction to prevent unwanted zoom resets
    if (map.current) {
      map.current.on('zoomstart dragstart', () => {
        hasUserInteracted.current = true;
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitialized.current = false;
        hasUserInteracted.current = false;
        if (setMapInstance) setMapInstance(null);
      }
    };
  }, []);

  // Gestion dynamique du fond de carte
  useEffect(() => {
    if (!map.current) return;
    map.current.eachLayer(layer => {
      if ((layer as any).options && (layer as any).options.attribution) {
        map.current?.removeLayer(layer);
      }
    });
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '© OpenStreetMap contributors';
    if (layerType === 'google') {
      tileUrl = 'http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      attribution = '© Google Maps';
    } else if (layerType === 'satellite') {
      tileUrl = 'http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      attribution = '© Google Satellite';
    } else if (layerType === 'hybrid') {
      tileUrl = 'http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '© Google Hybrid';
    } else if (layerType === 'terrain') {
      tileUrl = 'http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      attribution = '© Google Terrain';
    } else if (layerType === 'traffic') {
      tileUrl = 'http://mt1.google.com/vt/lyrs=h@221097413&x={x}&y={y}&z={z}';
      attribution = '© Google Traffic';
    }
    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
      minZoom: 2
    }).addTo(map.current);
  }, [layerType]);

  useEffect(() => {
    if (!map.current || !isInitialized.current) return;

    // Create new markers
    markersRef.current = createMarkers({
      warehouses,
      chauffeurs,
      map: map.current,
      t,
      onWarehouseClick,
      onChauffeurClick,
      isMobile: true,
      highlightedWarehouseId
    });

    // Only fit map to markers if user hasn't interacted with the map
    if (markersRef.current.length > 0 && !hasUserInteracted.current) {
      fitMapToMarkers(map.current, markersRef.current, false);
    }
  }, [warehouses, chauffeurs, onWarehouseClick, onChauffeurClick, t]);

  // Focus sur l'entrepôt sélectionné
  useEffect(() => {
    if (!map.current || !isInitialized.current || !focusedWarehouseId) return;
    const warehouse = warehouses.find(w => w.id === focusedWarehouseId);
    if (warehouse) {
      map.current.setView([warehouse.coordinates.lat, warehouse.coordinates.lng], 15, { animate: true });
      // Ouvre le popup du marker correspondant
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - warehouse.coordinates.lat) < 1e-6 && Math.abs(pos.lng - warehouse.coordinates.lng) < 1e-6;
      });
      if (marker) marker.openPopup();
    }
  }, [focusedWarehouseId, warehouses]);

  const handleZoomIn = () => {
    if (map.current) {
      hasUserInteracted.current = true;
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      hasUserInteracted.current = true;
      map.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (map.current) {
      hasUserInteracted.current = false;
      resetMapView(map.current, markersRef.current);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={mapRef} 
        style={{ 
          height: isFullscreen ? '100vh' : height, 
          width: '100%',
          minHeight: '300px'
        }} 
        className={`rounded-lg border border-border bg-card shadow-sm ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
      />
      {/* Boutons superposés en bas de la carte */}
      <div className="absolute z-30 bottom-4 left-0 w-full flex flex-col items-center pointer-events-none">
        {/* Calque bouton (à droite) */}
        <div className="flex justify-end w-full pr-6 mb-2 pointer-events-auto">
          {/* Ici tu peux ajouter le bouton calque si besoin, ou le laisser dans le parent */}
        </div>
        {/* Bouton liste centré */}
        {showListButton && (
          <div className="w-11/12 md:w-1/2 flex justify-center pointer-events-auto">
            <button
              type="button"
              className="w-full rounded-full shadow-lg text-base font-semibold bg-primary text-primary-foreground py-3 px-4"
              onClick={() => {
                const listSection = document.getElementById('entrepot-list-section');
                if (listSection) {
                  listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span className="material-icons align-middle mr-2">list_alt</span>
              Voir la liste des entrepôts
            </button>
          </div>
        )}
      </div>
      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
    </div>
  );
};

export default MobileOpenStreetMap;
