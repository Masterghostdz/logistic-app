
import React from 'react';
import { Button } from '../ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      <Button
        size="sm"
        variant="secondary"
        onClick={onZoomIn}
        className="w-10 h-10 p-0 rounded-full shadow-md"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onZoomOut}
        className="w-10 h-10 p-0 rounded-full shadow-md"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={onReset}
        className="w-10 h-10 p-0 rounded-full shadow-md"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControls;
