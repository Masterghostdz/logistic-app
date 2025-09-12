import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Layers } from 'lucide-react';
import OpenStreetMap from '../OpenStreetMap';
import L from 'leaflet';

interface ClientMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: { name: string; coordinates: { lat: number; lng: number } } | null;
}

const ClientMapDialog = ({ isOpen, onClose, client }: ClientMapDialogProps) => {
  const mapRef = useRef<any>(null);
  const [layerType, setLayerType] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  useEffect(() => {
    if (!isOpen || !client) return;
    // Ajoute un marker fixe à la position du client
    const interval = setInterval(() => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        // Nettoie les anciens markers
        mapRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
        });
        // Ajoute le marker à la position exacte
  const lat = typeof client.coordinates.lat === 'string' ? parseFloat(client.coordinates.lat) : client.coordinates.lat;
  const lng = typeof client.coordinates.lng === 'string' ? parseFloat(client.coordinates.lng) : client.coordinates.lng;
  const marker = L.marker(L.latLng(lat, lng)).addTo(mapRef.current);
  marker.bindPopup(`Position enregistrée :<br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`).openPopup();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, client, layerType]);
  if (!client) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 700, minWidth: 350 }}>
        <DialogHeader>
          <DialogTitle>Position du client : {client.name}</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col">
          <div
            className="relative w-full rounded-xl shadow-2xl bg-transparent"
            style={{ height: 320, minHeight: 320, maxWidth: 600, background: 'transparent', padding: 0, margin: 0 }}
          >
            {/* Bouton calques à l'intérieur de la map, fixé en bas droite */}
            <div className="pointer-events-none absolute z-30 bottom-6 right-6 w-auto h-auto">
              <div className="relative flex flex-col items-end">
                <div className="pointer-events-auto">
                  <Button size="icon" variant="ghost" className="bg-white/90 dark:bg-muted/90 text-dark dark:text-white rounded-full shadow-lg border border-gray-300" title="Changer le fond de carte" onClick={() => setShowLayerMenu(v => !v)}>
                    <Layers className="w-6 h-6" />
                  </Button>
                </div>
                {showLayerMenu && (
                  <div className="pointer-events-auto mb-2 bg-white dark:bg-muted rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1 animate-fade-in z-40" style={{position:'absolute', bottom:'100%', right:0}}>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='osm' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('osm'); setShowLayerMenu(false); }}>OpenStreetMap</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='google' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('google'); setShowLayerMenu(false); }}>Google Maps</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='satellite' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('satellite'); setShowLayerMenu(false); }}>Satellite</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='hybrid' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('hybrid'); setShowLayerMenu(false); }}>Hybride</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='terrain' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('terrain'); setShowLayerMenu(false); }}>Terrain</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='traffic' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('traffic'); setShowLayerMenu(false); }}>Traffic</button>
                  </div>
                )}
              </div>
            </div>
            <div
              className="vue2leaflet-map leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom w-full h-full rounded-xl overflow-hidden"
              style={{ height: '100%', width: '100%', minHeight: 320, position: 'relative', zIndex: 10, background: 'transparent', padding: 0, margin: 0 }}
            >
              <OpenStreetMap
                height="100%"
                userPosition={client.coordinates}
                setMapInstance={ref => { mapRef.current = ref; }}
                layerType={layerType}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMapDialog;
