
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
}

const MobileOpenStreetMap: React.FC<MobileOpenStreetMapProps> = ({ 
  warehouses = [], 
  chauffeurs = [],
  height = '400px',
  onWarehouseClick,
  onChauffeurClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isInitialized = useRef(false);
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map with mobile-optimized settings
    map.current = createMap(mapRef.current, {
      zoomControl: false, // We'll use custom controls
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: false, // Disable for mobile
      keyboard: false, // Disable for mobile
      dragging: true
    });
    
    isInitialized.current = true;

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
      }
    };
  }, []);

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
      isMobile: true
    });

    // Only fit map to markers if user hasn't interacted with the map
    if (markersRef.current.length > 0 && !hasUserInteracted.current) {
      fitMapToMarkers(map.current, markersRef.current, false);
    }
  }, [warehouses, chauffeurs, onWarehouseClick, onChauffeurClick, t]);

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
      
      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
    </div>
  );
};

export default MobileOpenStreetMap;
