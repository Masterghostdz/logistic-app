
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { pushService } from './pushService';

export interface DeviceInfo {
  isNative: boolean;
  platform: string;
  isAndroid: boolean;
  isIOS: boolean;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

class MobileService {
  private deviceInfo: DeviceInfo | null = null;

  async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      console.log('Initializing mobile services...');
      
      // Get device info
      this.deviceInfo = await this.getDeviceInfo();
      
      // Configure status bar: prefer native/system defaults and allow the WebView to draw
      // behind the system bars so the web layer can use safe-area insets. Avoid forcing
      // a white background or text style from the web layer; let the OS choose the best
      // contrast and appearance for each device.
      if (this.deviceInfo.isAndroid || this.deviceInfo.isIOS) {
        try {
          // Allow the status bar to overlay the WebView so CSS env(safe-area-inset-*)
          // values can be used without the web layer needing to add extra top padding.
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch (e) {
          console.warn('StatusBar.setOverlaysWebView not supported on this platform', e);
        }
        // Do not set style or background color here; prefer the system default.
      }

      // Add classes to the document root so CSS can apply native-specific layout adjustments
      try {
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.classList.add('native-app');
          if (this.deviceInfo.isAndroid) {
            document.documentElement.classList.add('android-native');
            // Do not override --native-top-offset here; native insets are handled
            // by CSS env(safe-area-inset-*) and by the native window edge-to-edge config.
          }
        }
      } catch (e) {
        // ignore if running in non-DOM environment
      }

      // Hide splash screen after app is ready
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);
      // Register for push notifications on native platforms
      try {
        await pushService.register();
      } catch (e) {
        console.warn('Push service registration failed', e);
      }
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const isNative = Capacitor.isNativePlatform();
    let platform = 'web';
    
    if (isNative) {
      const info = await Device.getInfo();
      platform = info.platform;
    }

    this.deviceInfo = {
      isNative,
      platform,
      isAndroid: platform === 'android',
      isIOS: platform === 'ios'
    };

    return this.deviceInfo;
  }

  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      // Sur le web, il faut toujours tenter getCurrentPosition pour déclencher le prompt navigateur
      let position;
      // On native platforms, ensure runtime permissions are granted first
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await Geolocation.checkPermissions();
          if (perm.location !== 'granted') {
            const req = await Geolocation.requestPermissions();
            if (req.location !== 'granted') {
              console.error('Location permission not granted:', req);
              // Let caller decide how to handle (UI toast/alert). Return null to indicate no location.
              return null;
            }
          }
        } catch (pErr) {
          console.error('Error checking/requesting location permissions:', pErr);
          // Fall back to attempting getCurrentPosition which may trigger a prompt on web
        }
      }

      try {
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
      } catch (err) {
        // Si refus ou erreur, on log et retourne null
        console.error('Error getting location:', err);
        return null;
      }
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async watchLocation(callback: (location: LocationCoordinates) => void): Promise<string | null> {
    try {
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }

      const watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
      }, (position, err) => {
        if (err) {
          console.error('Location watch error:', err);
          return;
        }

        if (position) {
          callback({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        }
      });

      return watchId;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  async clearLocationWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error clearing location watch:', error);
    }
  }

  isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
  }

  getPlatform(): string {
    return this.deviceInfo?.platform || 'web';
  }
}

export const mobileService = new MobileService();
