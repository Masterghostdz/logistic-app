import React, { useEffect, useState, useRef } from 'react';
import { getTranslation } from '../lib/translations';
import { toast } from './ui/use-toast';

interface CameraPreviewModalProps {
  isOpen: boolean;
  onPhotoTaken: (dataUrl: string) => void;
  onClose: () => void;
  language?: string; // optionnel pour compatibilité
}

function CameraPreviewModal({ isOpen, onPhotoTaken, onClose, language }: CameraPreviewModalProps) {
  // Utilise la langue passée en prop (app), sinon fallback navigateur, sinon fr
  let lang = language;
  if (!lang) {
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.startsWith('ar')) lang = 'ar';
      else if (navigator.language.startsWith('fr')) lang = 'fr';
      else lang = 'en';
    } else {
      lang = 'fr';
    }
  }
  const t = (key: string) => getTranslation(key, lang!);
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

  // Prevent background scrolling when modal is open (body & html, mobile safe)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const html = document.documentElement;
    // Save previous styles
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyWidth = body.style.width;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlPosition = html.style.position;
    const prevHtmlWidth = html.style.width;
    if (isOpen) {
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100vw';
      html.style.overflow = 'hidden';
      html.style.position = 'fixed';
      html.style.width = '100vw';
    }
    return () => {
      body.style.overflow = prevBodyOverflow || '';
      body.style.position = prevBodyPosition || '';
      body.style.width = prevBodyWidth || '';
      html.style.overflow = prevHtmlOverflow || '';
      html.style.position = prevHtmlPosition || '';
      html.style.width = prevHtmlWidth || '';
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
        toast({ title: t('camera.error.save'), variant: 'destructive', duration: 2500 });
        setPreview(null);
        setSaveError(false);
        onClose(); // ferme le calque et stoppe la caméra, skip acceptance window
      }
    }
  };

  const handleRetake = () => {
    // Clear preview and make sure the video element receives the active stream again
    setPreview(null);
    setSaveError(false);
    // If the stream is still available, attach it to the video element and play
    requestAnimationFrame(() => {
      if (streamRef.current && videoRef.current) {
        try {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
          setCameraReady(true);
        } catch (e) {
          // ignore attach errors
        }
      }
    });
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    // root overlay: fixed, 100dvh/100vw, prevent scrolling
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-80 overflow-hidden"
      style={{ pointerEvents: 'auto', height: '100dvh', width: '100vw' }}
    >
      {/* inner container that holds the media and overlays */}
      <div className="relative" style={{ height: '100dvh', width: '100vw' }}>
      {error && <div className="absolute top-4 left-4 bg-red-600 text-white p-2 rounded z-50">{error}</div>}
      {/* Error notice now handled by toast, not modal overlay */}
      {preview ? (
        // Preview mode: show the captured image centered and overlay action buttons
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{ height: '100dvh', width: '100vw' }}>
          <img
            src={preview}
            alt="preview"
            className="object-contain rounded shadow-lg"
            style={{ maxHeight: '75dvh', maxWidth: '90vw' }}
          />
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-50">
            <div className="flex gap-6 px-6 py-4 rounded-xl border-2 border-blue-500 bg-black bg-opacity-60 shadow-lg"
              style={{ boxShadow: '0 2px 12px 0 #007cf0', borderColor: '#007cf0', backdropFilter: 'blur(6px)' }}>
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
        // Camera mode: make video full-bleed and overlay controls
        <div className="absolute inset-0 z-50" style={{ height: '100dvh', width: '100vw' }}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            style={{ zIndex: 10, height: '100dvh', width: '100vw' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Controls fixed overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ height: '100dvh', width: '100vw' }}>
            <div className="absolute bottom-4 left-0 w-full flex justify-center z-[1000] pointer-events-auto">
              {loadingCamera ? (
                <div className="flex items-center justify-center w-16 h-16">
                  <div className="loader border-4 border-white border-t-transparent rounded-full w-12 h-12 animate-spin" />
                </div>
              ) : cameraReady ? (
                <button onClick={takePhoto} className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-white" title="Prendre la photo">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="white"/></svg>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white">
                  <div>Initialisation caméra…</div>
                </div>
              )}
            </div>

            <button onClick={handleClose} className="absolute top-4 left-4 bg-black bg-opacity-60 text-white rounded-full w-12 h-12 flex items-center justify-center z-[1001] pointer-events-auto" title="Annuler">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default CameraPreviewModal;