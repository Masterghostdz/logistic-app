import { Capacitor } from '@capacitor/core';
let PushNotifications: any = null;
let localNotification: any = null;
try {
  // dynamic import so web builds don't fail if Capacitor plugins are not present
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PushNotifications = require('@capacitor/push-notifications').PushNotifications;
  localNotification = require('./localNotification').localNotification;
} catch (e) {
  // running in web or plugins not installed — we'll gracefully noop
}

import { db } from './firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from './firebaseClient';

export const pushService = {
  async register() {
    if (!Capacitor.isNativePlatform() || !PushNotifications) {
      console.warn('PushNotifications not available on this platform');
      return;
    }

    try {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        console.warn('Push permission not granted');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token: any) => {
        console.log('Push registration success, token: ', token.value);
        // If user is authenticated, save token to their Firestore user doc
        try {
          const user = auth.currentUser;
          if (user && user.uid) {
            const uref = doc(db, 'users', user.uid);
            await setDoc(uref, { fcmToken: token.value }, { merge: true });
          }
        } catch (e) {
          console.warn('Failed to save token to Firestore', e);
        }
      });

      PushNotifications.addListener('registrationError', (err: any) => {
        console.error('Push registration error: ', err);
      });

      // When app is in foreground and a push arrives
      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('Push received in foreground', notification);
        // show a local native notification to match background behaviour
        try {
          localNotification?.show(notification.title || 'Notification', notification.body || '');
        } catch (e) {
          console.error('Error showing local notification', e);
        }
      });

      // When user taps the push
      PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('Push action performed: ', action);
      });
    } catch (e) {
      console.error('Error registering for push', e);
    }
  }
};
