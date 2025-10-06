import { LocalNotifications } from '@capacitor/local-notifications';

export const localNotification = {
  async show(title: string, body: string) {
    try {
      if ((LocalNotifications as any).requestPermissions) {
        await LocalNotifications.requestPermissions();
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            smallIcon: 'ic_stat_notify',
            sound: null,
            schedule: { at: new Date(Date.now() + 100) }
          }
        ]
      });
    } catch (e) {
      console.error('Local notification error', e);
      // Fallback to Web Notifications when running in web
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') new Notification(title, { body });
        });
      }
    }
  }
};
