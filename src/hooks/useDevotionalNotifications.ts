import { useEffect, useRef } from 'react';
import { getCurrentDevotional, DailyDevotional } from '../data/devotionals';
import { notificationService } from '../services/notifications';

export const useDevotionalNotifications = () => {
  const hasNotifiedMorning = useRef(false);
  const hasNotifiedMidday = useRef(false);
  const hasNotifiedEvening = useRef(false);

  useEffect(() => {
    // Check permission
    if (notificationService.getPermissionStatus() === 'default') {
      notificationService.requestPermission();
    }

    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const devotional = getCurrentDevotional();

      const sendNotification = (title: string, body: string, slot: string) => {
        notificationService.notify({
          type: 'system',
          title: title,
          body: body,
          playSound: true,
          actionId: 'devotional-nav'
        });
      };

      // Morning (8 AM)
      if (hour === 8 && !hasNotifiedMorning.current) {
        sendNotification(
          devotional.morning.title,
          devotional.morning.reference,
          'morning'
        );
        hasNotifiedMorning.current = true;
      }
      
      // Midday (12 PM)
      if (hour === 12 && !hasNotifiedMidday.current) {
        sendNotification(
          devotional.midday.title,
          devotional.midday.reference,
          'midday'
        );
        hasNotifiedMidday.current = true;
      }

      // Evening (8 PM / 20:00)
      if (hour === 20 && !hasNotifiedEvening.current) {
        sendNotification(
          devotional.evening.title,
          devotional.evening.reference,
          'evening'
        );
        hasNotifiedEvening.current = true;
      }

      // Reset flags at midnight
      if (hour === 0) {
        hasNotifiedMorning.current = false;
        hasNotifiedMidday.current = false;
        hasNotifiedEvening.current = false;
      }
    };

    // Run check immediately, then every minute
    checkTime();
    const intervalId = setInterval(checkTime, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
};
