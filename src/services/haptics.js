import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function playNudge() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function playHey() {
  for (let i = 0; i < 3; i++) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await sleep(200);
  }
}

let urgentInterval = null;

export async function playUrgent() {
  stopUrgent();
  const burst = async () => {
    for (let i = 0; i < 5; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await sleep(150);
    }
  };
  await burst();
  urgentInterval = setInterval(burst, 15000);
}

export function stopUrgent() {
  if (urgentInterval) {
    clearInterval(urgentInterval);
    urgentInterval = null;
  }
}

let emergencyInterval = null;

export async function playEmergency() {
  stopEmergency();
  const burst = async () => {
    for (let i = 0; i < 8; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await sleep(100);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await sleep(100);
    }
  };
  await burst();
  emergencyInterval = setInterval(burst, 5000);
}

export function stopEmergency() {
  if (emergencyInterval) {
    clearInterval(emergencyInterval);
    emergencyInterval = null;
  }
}

export function stopAll() {
  stopUrgent();
  stopEmergency();
}

export async function playBuzz(level) {
  switch (level) {
    case 'nudge':
      return playNudge();
    case 'hey':
      return playHey();
    case 'urgent':
      return playUrgent();
    case 'emergency':
      return playEmergency();
    default:
      return playNudge();
  }
}
