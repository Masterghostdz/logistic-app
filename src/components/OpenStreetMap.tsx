
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

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map using utility function
    map.current = createSimpleMap(mapRef.current);

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

    // Create new markers using utility function
    markersRef.current = createMarkers({
      warehouses,
      chauffeurs,
      map: map.current,
      t,
      onWarehouseClick,
      onChauffeurClick,
      isMobile: false // Desktop version
    });

    // Fit map to show all markers
    fitMapToMarkers(map.current, markersRef.current);
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
