import React, { useEffect, useState, useRef } from 'react';
import { getTranslation } from '../lib/translations';
import { toast } from './ui/use-toast';

interface CameraPreviewModalProps {
  isOpen: boolean;
  onPhotoTaken: (dataUrl: string) => void;
  onClose: () => void;
}

function CameraPreviewModal({ isOpen, onPhotoTaken, onClose }: CameraPreviewModalProps) {
  // Replace useTranslation with getTranslation
  // Assume language is available via navigator.language or default to 'fr'
  const language = typeof navigator !== 'undefined' ? navigator.language : 'fr';
  const t = (key: string) => getTranslation(key, language);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [loadingCamera, setLoadingCamera] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setLoadingCamera(true);
    setError(null);
    setPreview(null);
    setCameraReady(false);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraReady(true);
        setLoadingCamera(false);
      })
      .catch(() => {
        setError("Impossible d'accéder à la caméra.");
        setLoadingCamera(false);
      });
    return () => {
      mounted = false;
      setCameraReady(false);
      setPreview(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Fonctions à placer ici
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);
    }
  };

  const handleSend = async () => {
    if (preview) {
      try {
        await Promise.resolve(onPhotoTaken(preview));
        setPreview(null);
        setSaveError(false);
        onClose();
      } catch (e) {
        toast({ title: t('camera.error.save'), variant: 'destructive' });
        setPreview(null);
        setSaveError(false);
        onClose(); // ferme le calque et stoppe la caméra, skip acceptance window
      }
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setSaveError(false);
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-80" style={{ pointerEvents: 'auto' }}>
      {error && <div className="absolute top-4 left-4 bg-red-600 text-white p-2 rounded z-50">{error}</div>}
      {/* Error notice now handled by toast, not modal overlay */}
      {preview ? (
        <div className="relative z-50 flex flex-col items-center justify-center w-full h-full">
          <img src={preview} alt="preview" className="max-w-xs max-h-[60vh] rounded shadow-lg" />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center">
            <div className="flex gap-8 px-6 py-4 rounded-xl border-2 border-blue-500 bg-black bg-opacity-60 shadow-lg" style={{ boxShadow: '0 2px 12px 0 #007cf0', borderColor: '#007cf0', backdropFilter: 'blur(6px)' }}>
              <button onClick={handleSend} className="bg-green-500 hover:bg-green-400 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white transition" title="Envoyer la photo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={handleRetake} className="bg-red-600 hover:bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white transition" title="Reprendre la photo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-50 flex flex-col items-center justify-center w-full h-full">
          <video ref={videoRef} className="w-full h-full object-cover rounded" autoPlay playsInline muted style={{ zIndex: 10 }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="fixed bottom-8 left-0 w-full flex justify-center z-[1000]">
            {loadingCamera ? (
              <div className="flex items-center justify-center w-16 h-16">
                <div className="loader border-4 border-white border-t-transparent rounded-full w-12 h-12 animate-spin" />
              </div>
            ) : cameraReady ? (
              <button onClick={takePhoto} className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-white" title="Prendre la photo">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="white"/></svg>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="text-white">Initialisation caméra…</div>
              </div>
            )}
          </div>
          <button onClick={handleClose} className="absolute top-4 left-4 bg-black bg-opacity-60 text-white rounded-full w-12 h-12 flex items-center justify-center z-[1001]" title="Annuler">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraPreviewModal;