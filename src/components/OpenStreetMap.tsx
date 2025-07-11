
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse, Chauffeur } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { initializeLeafletIcons } from './map/MapIcons';
import { createSimpleMap } from './map/MapUtils';
import { createMarkers, fitMapToMarkers } from './map/MapMarkers';

interface OpenStreetMapProps {
  warehouses?: Warehouse[];
  chauffeurs?: Chauffeur[];
  height?: string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
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
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map using utility function
    map.current = createSimpleMap(mapRef.current);
    isInitialized.current = true;

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isInitialized.current) return;

    // Create new markers using utility function - no need to clear existing ones
    markersRef.current = createMarkers({
      warehouses,
      chauffeurs,
      map: map.current,
      t,
      onWarehouseClick,
      onChauffeurClick,
      isMobile: false // Desktop version
    });

    // Fit map to show all markers only on first load or when markers change significantly
    if (markersRef.current.length > 0) {
      fitMapToMarkers(map.current, markersRef.current);
    }
  }, [warehouses, chauffeurs, onWarehouseClick, onChauffeurClick, t]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }} 
      className="rounded-lg border border-border bg-card shadow-sm" 
    />
  );
};

export default OpenStreetMap;
