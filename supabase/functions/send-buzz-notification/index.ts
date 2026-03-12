// Supabase Edge Function: send-buzz-notification
// Sends push notification via Expo Push API when a buzz is sent

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface BuzzRequest {
  buzzId: string;
  receiverId: string;
  level: string;
  message: string;
}

const levelConfig: Record<string, { title: string; sound: string; priority: string }> = {
  nudge: {
    title: "👋 Nudge",
    sound: "default",
    priority: "default",
  },
  hey: {
    title: "📳 Hey!",
    sound: "default",
    priority: "high",
  },
  urgent: {
    title: "🚨 URGENT",
    sound: "default",
    priority: "high",
  },
  emergency: {
    title: "🆘 EMERGENCY",
    sound: "default",
    priority: "high",
  },
};

Deno.serve(async (req) => {
  try {
    const { buzzId, receiverId, level, message }: BuzzRequest = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: receiver } = await supabase
      .from("profiles")
      .select("push_token, display_name")
      .eq("id", receiverId)
      .single();

    if (!receiver?.push_token) {
      return new Response(
        JSON.stringify({ error: "Receiver has no push token" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const config = levelConfig[level] || levelConfig.nudge;
    const body = message || config.title;

    const pushMessage = {
      to: receiver.push_token,
      title: config.title,
      body,
      sound: config.sound,
      priority: config.priority,
      data: {
        buzzId,
        level,
        message,
        type: "buzz",
      },
      categoryId: level === "urgent" || level === "emergency" ? "urgent-buzz" : "buzz",
    };

    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(pushMessage),
    });

    const pushResult = await pushResponse.json();

    return new Response(JSON.stringify({ success: true, pushResult }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
