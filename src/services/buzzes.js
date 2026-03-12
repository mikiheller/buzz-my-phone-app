import { supabase } from '../config/supabase';

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

  await supabase.functions.invoke('send-buzz-notification', {
    body: { buzzId: data.id, receiverId, level, message },
  });

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
