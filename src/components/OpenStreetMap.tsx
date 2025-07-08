
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse, Chauffeur } from '../types';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Warehouse icon
const warehouseIcon = L.divIcon({
  html: `<div style="background-color: #059669; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏭</div>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Chauffeur icon
const chauffeurIcon = L.divIcon({
  html: `<div style="background-color: #dc2626; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🚛</div>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

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

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map centered on Algeria
    map.current = L.map(mapRef.current).setView([28.0339, 1.6596], 6); // Algeria center

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
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
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${warehouse.name}</h3>
            <p class="text-sm text-gray-600 mb-1"><strong>Société:</strong> ${warehouse.companyName}</p>
            <p class="text-sm text-gray-600 mb-1"><strong>Adresse:</strong> ${warehouse.address}</p>
            <p class="text-sm text-gray-600"><strong>Téléphone:</strong> ${warehouse.phone}</p>
          </div>
        `);

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
            <div class="p-3 min-w-[200px]">
              <h3 class="font-semibold text-lg mb-2">${displayName}</h3>
              <p class="text-sm text-gray-600 mb-1"><strong>Type:</strong> ${chauffeur.employeeType}</p>
              <p class="text-sm text-gray-600 mb-1"><strong>Véhicule:</strong> ${chauffeur.vehicleType}</p>
              <p class="text-sm text-gray-600"><strong>Téléphone:</strong> ${chauffeur.phone}</p>
            </div>
          `);

        if (onChauffeurClick) {
          marker.on('click', () => onChauffeurClick(chauffeur));
        }

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [warehouses, chauffeurs, onWarehouseClick, onChauffeurClick]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />;
};

export default OpenStreetMap;
