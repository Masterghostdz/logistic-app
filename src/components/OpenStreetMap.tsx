
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse, Chauffeur } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { initializeLeafletIcons } from './map/MapIcons';
import { createSimpleMap } from './map/MapUtils';
import { createMarkers, fitMapToMarkers } from './map/MapMarkers';

interface OpenStreetMapProps {
  highlightedWarehouseId?: string | null;
  warehouses?: Warehouse[];
  chauffeurs?: Chauffeur[];
  height?: string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onChauffeurClick?: (chauffeur: Chauffeur) => void;
  focusedWarehouseId?: string | null;
  setMapInstance?: (map: any) => void;
  layerType?: string;
  userPosition?: { lat: number; lng: number } | null;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  warehouses = [], 
  chauffeurs = [],
  height = '100%',
  onWarehouseClick,
  onChauffeurClick,
  focusedWarehouseId,
  setMapInstance,
  layerType = 'osm',
  userPosition,
  highlightedWarehouseId
}) => {
  // Marqueur animé pour la position utilisateur
  const userMarkerRef = useRef<L.Marker | null>(null);
  useEffect(() => {
    if (!map.current) return;
    // Supprime l'ancien marker
    if (userMarkerRef.current) {
      map.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userPosition) {
      // Utilise l'icône Material "gps_fixed" comme marker animé
      const iconHtml = `
        <span style="position: relative; display: flex; align-items: center; justify-content: center; width: 54px; height: 54px;">
          <span class="gps-glow"></span>
          <span class="material-icons gps-animated" style="font-size: 40px; z-index: 2;">gps_fixed</span>
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
      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], { icon }).addTo(map.current);
    }
  }, [userPosition]);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { t } = useTranslation();
  const isInitialized = useRef(false);


  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    // Initialize Leaflet icons
    initializeLeafletIcons();

    // Create map
    map.current = L.map(mapRef.current, {
      center: [28.0339, 1.6596],
      zoom: 6,
      zoomControl: false, // Désactive les boutons natifs de zoom
      attributionControl: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true
    });
    isInitialized.current = true;
    if (setMapInstance) setMapInstance(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitialized.current = false;
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

    // Create new markers using utility function - no need to clear existing ones
    markersRef.current = createMarkers({
      warehouses,
      chauffeurs,
      map: map.current,
      t,
      onWarehouseClick,
      onChauffeurClick,
      isMobile: false, // Desktop version
      highlightedWarehouseId
    });

    // Fit map to show all markers only on first load or when markers change significantly
    if (markersRef.current.length > 0) {
      fitMapToMarkers(map.current, markersRef.current);
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

  // Fond gris forcé en mode Traffic
  const background = layerType === 'traffic' ? '#e5e7eb' : 'transparent';
  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%', background }} 
      className="rounded-lg border border-border bg-card shadow-sm" 
    />
  );
};

export default OpenStreetMap;
