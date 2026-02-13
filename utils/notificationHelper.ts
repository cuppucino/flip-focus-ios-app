import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const request_notification_permissions = async (): Promise<boolean> => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.error('Notification permission error', e);
    return false;
  }
};

export const schedule_daily_reminder = async (hour: number): Promise<void> => {
  try {
    // Cancel any existing reminders first
    await cancel_reminder();

    const granted = await request_notification_permissions();
    if (!granted) {
      console.warn('Notification permissions not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Time to Focus!',
        body: "You haven't focused today. Flip your phone and start a session!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: 0,
      },
    });
  } catch (e) {
    console.error('Failed to schedule reminder', e);
  }
};

export const cancel_reminder = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error('Failed to cancel reminder', e);
  }
};
