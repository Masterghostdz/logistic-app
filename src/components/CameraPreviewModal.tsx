import React, { useEffect, useState } from 'react';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

interface CameraPreviewModalProps {
  isOpen: boolean;
  onPhotoTaken: (dataUrl: string) => void;
  onClose: () => void;
}

const previewOpts: CameraPreviewOptions = {
  position: 'rear',
  parent: 'camera-preview-container',
  className: 'camera-preview',
  toBack: false,
  width: window.innerWidth,
  height: window.innerHeight,
};

function CameraPreviewModal({ isOpen, onPhotoTaken, onClose }: CameraPreviewModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile ? useIsMobile() : window.innerWidth <= 500;

  useEffect(() => {
    if (isOpen) {
      CameraPreview.start(previewOpts).catch(() => setError('Impossible d\'accéder à la caméra.'));
    }
    return () => {
      CameraPreview.stop();
    };
  }, [isOpen]);

  const takePhoto = async () => {
    try {
      const result = await CameraPreview.capture({ quality: 80 });
      setPreview('data:image/jpeg;base64,' + result.value);
    } catch (e) {
      setError('Erreur lors de la capture de la photo.');
    }
  };

  const handleSend = () => {
    if (preview) {
      onPhotoTaken(preview);
      setPreview(null);
    }
  };

  const handleRetake = () => {
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-80" style={{ pointerEvents: 'auto' }}>
      <div id="camera-preview-container" className="absolute inset-0" />
      {error && <div className="absolute top-4 left-4 bg-red-600 text-white p-2 rounded">{error}</div>}
      {preview ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <img src={preview} alt="preview" className="max-w-xs max-h-[60vh] rounded shadow-lg" />
          {/* Boutons valider/reprendre flottants en bas pour mobile */}
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center"
          >
            <div
              className="flex gap-8 px-6 py-4 rounded-xl border-2 border-blue-500 bg-black bg-opacity-60 shadow-lg"
              style={{
                boxShadow: '0 2px 12px 0 #007cf0',
                borderColor: '#007cf0',
                backdropFilter: 'blur(6px)',
              }}
            >
              <button
                onClick={handleSend}
                className="bg-green-500 hover:bg-green-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white transition"
                title="Envoyer la photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleRetake}
                className="bg-red-600 hover:bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white transition"
                title="Reprendre la photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {/* Bouton capture rond centré en bas */}
          <div className="fixed bottom-8 left-0 w-full flex justify-center z-50">
            <button
              onClick={takePhoto}
              className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-white"
              title="Prendre la photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="white"/>
              </svg>
            </button>
          </div>
          {/* Bouton annuler en haut à gauche */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-black bg-opacity-60 text-white rounded-full w-12 h-12 flex items-center justify-center z-50"
            title="Annuler"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPreviewModal;
