
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Warehouse } from '../types';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapProps {
  warehouses: Warehouse[];
  height?: string;
  onWarehouseClick?: (warehouse: Warehouse) => void;
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  warehouses, 
  height = '400px',
  onWarehouseClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    map.current = L.map(mapRef.current).setView([33.5731, -7.5898], 6); // Morocco center

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

    // Add new markers
    warehouses.forEach(warehouse => {
      const marker = L.marker([warehouse.coordinates.lat, warehouse.coordinates.lng])
        .addTo(map.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-medium">${warehouse.name}</h3>
            <p class="text-sm text-gray-600">${warehouse.companyName}</p>
            <p class="text-sm">${warehouse.address}</p>
            <p class="text-sm">${warehouse.phone}</p>
          </div>
        `);

      if (onWarehouseClick) {
        marker.on('click', () => onWarehouseClick(warehouse));
      }

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (warehouses.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [warehouses, onWarehouseClick]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />;
};

export default OpenStreetMap;
