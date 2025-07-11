
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

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map
    map.current = createMap(mapRef.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Create new markers
    markersRef.current = createMarkers({
      warehouses,
      chauffeurs,
      map: map.current,
      t,
      onWarehouseClick,
      onChauffeurClick
    });

    // Fit map to show all markers
    fitMapToMarkers(map.current, markersRef.current);
  }, [warehouses, chauffeurs, onWarehouseClick, onChauffeurClick, t]);

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (map.current) {
      resetMapView(map.current, markersRef.current);
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height: isFullscreen ? '100vh' : height, width: '100%' }} 
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
