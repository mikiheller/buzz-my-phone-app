import { supabase } from '../config/supabase';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const LEVEL_TITLES = {
  nudge: '👋 Nudge',
  hey: '📳 Hey!',
  urgent: '🚨 URGENT',
  emergency: '🆘 EMERGENCY',
};

async function sendPushNotification(pushToken, level, message, buzzId) {
  if (!pushToken) return;

  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        title: LEVEL_TITLES[level] || '📳 Buzz',
        body: message || LEVEL_TITLES[level],
        sound: 'default',
        priority: level === 'emergency' || level === 'urgent' ? 'high' : 'default',
        data: { buzzId, level, message, type: 'buzz' },
      }),
    });
  } catch (e) {
    console.warn('Push notification failed (buzz still sent):', e);
  }
}

export async function sendBuzz(senderId, receiverId, level, message = '') {
  const { data, error } = await supabase
    .from('buzzes')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      level,
      message,
      acknowledged: false,
    })
    .select()
    .single();

  if (error) throw error;

  const { data: receiver } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', receiverId)
    .single();

  await sendPushNotification(receiver?.push_token, level, message, data.id);

  return data;
}

export async function acknowledgeBuzz(buzzId) {
  const { error } = await supabase
    .from('buzzes')
    .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
    .eq('id', buzzId);

  if (error) throw error;
}

export async function getBuzzHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from('buzzes')
    .select('*, sender:sender_id(display_name), receiver:receiver_id(display_name)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export function subscribeToBuzzes(userId, onBuzz) {
  return supabase
    .channel('buzzes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'buzzes',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => onBuzz(payload.new)
    )
    .subscribe();
}
