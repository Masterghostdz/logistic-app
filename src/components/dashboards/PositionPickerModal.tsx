import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Layers } from 'lucide-react';
import OpenStreetMap from '../OpenStreetMap';

interface PositionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number };
}

const PositionPickerModal = ({ isOpen, onClose, onConfirm, initialPosition }: PositionPickerModalProps) => {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(initialPosition || null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [layerType, setLayerType] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  // Position GPS réelle (pour affichage du marker GPS)
  const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isOpen && initialPosition) setSelected(initialPosition);
    if (!isOpen) setSelected(initialPosition || null);
  }, [isOpen, initialPosition]);

  // Ajout d'un marker sur clic
  useEffect(() => {
    if (!mapInstance) return;
    const onClick = (e: any) => {
      setSelected({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    mapInstance.on('click', onClick);
    return () => { mapInstance.off('click', onClick); };
  }, [mapInstance]);

  // Ajout du marker draggable (pour sélection)
  useEffect(() => {
    if (!mapInstance || !selected) return;
    let marker: any = null;
    // Remove old marker
    mapInstance.eachLayer((layer: any) => {
      if (layer.options && layer.options.draggable) mapInstance.removeLayer(layer);
    });
    // Add new marker (sélection)
    marker = L.marker([selected.lat, selected.lng], { draggable: true }).addTo(mapInstance);
    marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      setSelected({ lat: pos.lat, lng: pos.lng });
    });
    return () => { if (marker) mapInstance.removeLayer(marker); };
  }, [mapInstance, selected]);

  // Ajout du marker GPS (fixe, non draggable)
  useEffect(() => {
    if (!mapInstance || !gpsPosition) return;
    let gpsMarker: any = null;
    // Remove old GPS marker
    mapInstance.eachLayer((layer: any) => {
      if (layer.options && layer.options.icon && layer.options.icon.options && layer.options.icon.options.className === 'gps-marker') {
        mapInstance.removeLayer(layer);
      }
    });
    // Add new GPS marker
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
      className: 'gps-marker',
      html: iconHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    gpsMarker = L.marker([gpsPosition.lat, gpsPosition.lng], { icon }).addTo(mapInstance);
    return () => { if (gpsMarker) mapInstance.removeLayer(gpsMarker); };
  }, [mapInstance, gpsPosition]);

  // Prendre la position GPS actuelle
  const handleGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSelected({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (mapInstance) mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
      },
      () => alert('Impossible de récupérer la position GPS'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: 700, minWidth: 350 }}>
        <DialogHeader>
          <DialogTitle>Choisir une position géographique</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col">
          <div
            className="relative w-full rounded-xl shadow-2xl bg-transparent"
            style={{ height: 320, minHeight: 320, maxWidth: 600, background: 'transparent', padding: 0, margin: 0 }}
          >
            {/* Overlay boutons flottants */}
            <div className="absolute z-20 top-4 left-4 flex flex-col gap-2">
              <Button size="icon" variant="ghost" className="bg-white/80 dark:bg-muted/80 text-dark dark:text-white rounded-lg shadow" title="GPS" onClick={handleGps}>
                <span className="material-icons">gps_fixed</span>
              </Button>
            </div>
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
                userPosition={gpsPosition}
                setMapInstance={setMapInstance}
                layerType={layerType}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            {selected ? `Lat: ${selected.lat.toFixed(6)}, Lng: ${selected.lng.toFixed(6)}` : 'Cliquez sur la carte pour marquer une position.'}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="button" onClick={() => selected && onConfirm(selected)} disabled={!selected}>
              Confirmer la position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PositionPickerModal;
