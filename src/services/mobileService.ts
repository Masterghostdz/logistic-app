
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

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
      
      // Configure status bar
      if (this.deviceInfo.isAndroid || this.deviceInfo.isIOS) {
        await StatusBar.setStyle({ style: Style.Default });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
      }

      // Hide splash screen after app is ready
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);
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
      // Check permissions first
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions();
        if (requestResult.location !== 'granted') {
          throw new Error('Location permission denied');
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

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
