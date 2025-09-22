import React, { useEffect, useState, useRef } from 'react';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

interface CameraPreviewModalProps {
  isOpen: boolean;
  onPhotoTaken: (dataUrl: string) => void;
  onClose: () => void;
}

const getPreviewOpts = (): CameraPreviewOptions => ({
  position: 'rear',
  parent: 'camera-preview-container',
  className: 'camera-preview',
  // Render preview behind the WebView; we'll make the WebView transparent so native preview is visible
  // Render preview behind the WebView (to avoid covering the app UI).
  // We may need to tune WebView transparency separately per-device.
  toBack: true,
  // Use devicePixelRatio to provide physical pixels to native preview (helps some devices/emulators)
  width: Math.max(1, Math.round(window.innerWidth * (window.devicePixelRatio || 1))),
  height: Math.max(1, Math.round(window.innerHeight * (window.devicePixelRatio || 1))),
});

function CameraPreviewModal({ isOpen, onPhotoTaken, onClose }: CameraPreviewModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [loadingCamera, setLoadingCamera] = useState<boolean>(false);
  const isMobile = useIsMobile ? useIsMobile() : window.innerWidth <= 500;

  const bodyOverflowPrevRef = useRef<string | null>(null);
  const startTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const caps: any = (window as any).Capacitor || null;
        const webviewPlugin = caps && caps.Plugins && (caps.Plugins.WebView || caps.Plugins.Webview) ? (caps.Plugins.WebView || caps.Plugins.Webview) : null;
        console.log('[CameraPreviewModal] webview plugin available?', !!webviewPlugin);
        if (webviewPlugin && typeof webviewPlugin.setBackgroundColor === 'function') {
          try {
            await webviewPlugin.setBackgroundColor({ color: '#00000000' });
            console.log('[CameraPreviewModal] webview made transparent');
          } catch (e) {
            console.warn('[CameraPreviewModal] setBackgroundColor failed', e);
          }
        }

        // runtime permission check
        if (CameraPreview && (CameraPreview as any).checkPermissions) {
          const perm = await (CameraPreview as any).checkPermissions();
          const cameraOk = perm && (perm.camera === 'granted' || perm.camera === 'granted');
          if (!cameraOk && (CameraPreview as any).requestPermissions) {
            const req = await (CameraPreview as any).requestPermissions();
            if (!req || req.camera !== 'granted') {
              setError('Permission caméra refusée.');
              return;
            }
          }
        }

        setLoadingCamera(true);
        // measure container and compute physical pixels
        const container = document.getElementById('camera-preview-container');
        let opts = getPreviewOpts();
        try {
          if (container) {
            const rect = container.getBoundingClientRect();
            const ratio = window.devicePixelRatio || 1;
            const w = Math.max(1, Math.round(rect.width * ratio));
            const h = Math.max(1, Math.round(rect.height * ratio));
            opts = { ...opts, width: w, height: h } as any;
            console.log('[CameraPreviewModal] container rect', rect, 'computed px', { w, h, ratio });
          } else {
            console.warn('[CameraPreviewModal] container not found, using default opts');
          }
        } catch (e) {
          console.warn('[CameraPreviewModal] measuring container failed', e);
        }
        console.log('[CameraPreviewModal] calling CameraPreview.start with opts', opts);
        await CameraPreview.start(opts);
        if (!mounted) return;
        setCameraReady(true);
      } catch (err: any) {
        console.error('CameraPreview start error:', err);
        if (err && err.message && typeof err.message === 'string' && err.message.includes('Missing the following permissions')) {
          setError('Permissions manquantes pour la caméra. Veuillez vérifier les permissions de l\'application.');
        } else {
          setError('Impossible d\'accéder à la caméra.');
        }
      } finally {
        if (mounted) setLoadingCamera(false);
      }
    };

    // If modal opens, prevent background scroll and start camera after a short delay
    if (isOpen) {
      console.log('[CameraPreviewModal] isOpen true — preparing camera start');
      try {
        bodyOverflowPrevRef.current = document.body.style.overflow || null;
        document.body.style.overflow = 'hidden';
      } catch (e) {
        console.warn('[CameraPreviewModal] could not set body overflow:', e);
      }
      // delay to ensure layout stabilizes after permission dialog/resume
      startTimeoutRef.current = window.setTimeout(() => {
        console.log('[CameraPreviewModal] delayed startCamera() executing');
        startCamera();
      }, 300);
    }

    // Restart camera when app resumes (permission dialogs may pause the activity)
    const caps: any = (window as any).Capacitor || null;
    let resumeHandler: any = { remove: () => {} };
    try {
      const appPlugin = caps && caps.Plugins && caps.Plugins.App ? caps.Plugins.App : null;
      if (appPlugin && typeof appPlugin.addListener === 'function') {
        resumeHandler = appPlugin.addListener('resume', async () => {
          try {
            if (isOpen && !cameraReady) {
              console.log('[CameraPreviewModal] resume event — restarting camera after short delay');
              if (startTimeoutRef.current) {
                clearTimeout(startTimeoutRef.current);
              }
              startTimeoutRef.current = window.setTimeout(async () => {
                setLoadingCamera(true);
                await startCamera();
                setLoadingCamera(false);
              }, 300);
            }
          } catch (e) {
            console.warn('Error restarting camera on resume', e);
          }
        });
      }
    } catch (e) {
      // ignore if Capacitor App plugin not available at runtime
    }

    return () => {
      mounted = false;
      try {
        console.log('[CameraPreviewModal] cleanup — stopping camera');
        if (startTimeoutRef.current) {
          clearTimeout(startTimeoutRef.current as number);
          startTimeoutRef.current = null;
        }
        if (CameraPreview && (CameraPreview as any).stop) {
          (CameraPreview as any).stop().then(() => console.log('[CameraPreviewModal] cleanup stop resolved')).catch((e: any) => console.warn('[CameraPreviewModal] cleanup stop error', e));
        }
      } catch (e) { console.warn('[CameraPreviewModal] cleanup stop sync error', e); }
      try { resumeHandler.remove(); } catch (e) { /* ignore */ }
      // restore body overflow
      try {
        if (bodyOverflowPrevRef.current !== null) {
          document.body.style.overflow = bodyOverflowPrevRef.current;
        } else {
          document.body.style.overflow = '';
        }
      } catch (e) { console.warn('[CameraPreviewModal] could not restore body overflow', e); }
      // restore webview background just in case
      try {
        const caps2: any = (window as any).Capacitor || null;
        const webviewPlugin2 = caps2 && caps2.Plugins && (caps2.Plugins.WebView || caps2.Plugins.Webview) ? (caps2.Plugins.WebView || caps2.Plugins.Webview) : null;
        if (webviewPlugin2 && typeof webviewPlugin2.setBackgroundColor === 'function') {
          webviewPlugin2.setBackgroundColor({ color: '#ffffff' });
        }
      } catch (e) { /* ignore */ }
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
    {/* Native preview container should be on a lower z so native view can render into it */}
    {/* Native preview container: smaller bottom-centered area so native surface doesn't cover the entire app */}
    <div
      id="camera-preview-container"
      className="fixed left-0 right-0 bottom-0 z-0"
      style={{
        pointerEvents: 'none',
        background: 'transparent',
        width: '100%',
        maxWidth: '100%',
        height: '60vh',
        maxHeight: '560px',
        margin: '0 auto',
        // avoid transforms; plugin may compute layout in screen coords
        overflow: 'hidden',
      }}
    />
      {error && <div className="absolute top-4 left-4 bg-red-600 text-white p-2 rounded">{error}</div>}
      {preview ? (
        <div className="relative z-30 flex flex-col items-center justify-center w-full h-full">
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
  <div className="relative z-30 flex flex-col items-center justify-center w-full h-full">
          {/* Bouton capture rond centré en bas — n'afficher que quand la caméra est prête */}
          <div className="fixed bottom-8 left-0 w-full flex justify-center z-50">
            {loadingCamera ? (
              <div className="flex items-center justify-center w-16 h-16">
                <div className="loader border-4 border-white border-t-transparent rounded-full w-12 h-12 animate-spin" />
              </div>
            ) : cameraReady ? (
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
            ) : (
              <div className="text-white">Initialisation caméra…</div>
            )}
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
