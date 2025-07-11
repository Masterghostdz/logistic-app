
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse, Chauffeur } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mobile-optimized icons
const warehouseIcon = L.divIcon({
  html: `<div style="
    background-color: rgba(0, 0, 0, 0.8); 
    color: white; 
    width: 32px; 
    height: 32px; 
    border-radius: 4px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    border: 2px solid rgba(255, 255, 255, 0.9); 
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); 
    font-size: 16px; 
    font-weight: bold;
  ">⌂</div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const chauffeurIcon = L.divIcon({
  html: `<div style="background-color: #dc2626; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 18px;">🚛</div>`,
  className: 'custom-div-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

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

    // Initialize map centered on Algeria with mobile-optimized settings
    map.current = L.map(mapRef.current, {
      center: [28.0339, 1.6596],
      zoom: 6,
      zoomControl: false, // We'll add custom controls
      attributionControl: false,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: false,
      keyboard: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map.current);

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

    // Add warehouse markers
    warehouses.forEach(warehouse => {
      const marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng], {
        icon: warehouseIcon
      })
        .addTo(map.current!)
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

      markersRef.current.push(marker);
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
          .addTo(map.current!)
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

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers with mobile-friendly padding
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.current.fitBounds(group.getBounds().pad(0.15));
    }
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
    if (map.current && markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.current.fitBounds(group.getBounds().pad(0.15));
    } else if (map.current) {
      map.current.setView([28.0339, 1.6596], 6);
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height: isFullscreen ? '100vh' : height, width: '100%' }} 
        className={`rounded-lg border border-border bg-card shadow-sm ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
      />
      
      {/* Mobile Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomIn}
          className="w-10 h-10 p-0 rounded-full shadow-md"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleZoomOut}
          className="w-10 h-10 p-0 rounded-full shadow-md"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReset}
          className="w-10 h-10 p-0 rounded-full shadow-md"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileOpenStreetMap;
