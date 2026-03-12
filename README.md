# BuzzMe 📳

A couples notification app that lets your partner send you buzzes with different urgency levels — from a gentle nudge to an unstoppable emergency alert.

## Buzz Levels

| Level | Name | Behavior |
|-------|------|----------|
| 👋 | **Nudge** | Single gentle vibration |
| 📳 | **Hey!** | 3 strong vibration bursts |
| 🚨 | **URGENT** | Repeats every 15 seconds until acknowledged |
| 🆘 | **EMERGENCY** | Max vibration + sound, repeats every 5 seconds until acknowledged |

## Features

- **Partner pairing** — Generate a 6-character code, share it with your partner, done
- **Custom messages** — Attach a short text to any buzz
- **Buzz history** — See all sent and received buzzes with timestamps
- **Real-time delivery** — Buzzes arrive instantly via push notifications + Supabase Realtime
- **Haptic feedback** — Different vibration patterns per urgency level

## Tech Stack

- **Frontend**: React Native (Expo SDK 55) with Expo Router
- **Backend**: Supabase (Auth, Database, Realtime, Edge Functions)
- **Notifications**: Expo Push Notifications
- **Haptics**: Expo Haptics

## Setup

### 1. Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone
- A [Supabase](https://supabase.com) account (free tier works)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`
3. Go to **Settings > API** and copy your **Project URL** and **anon/public key**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Deploy Edge Function

```bash
npx supabase functions deploy send-buzz-notification
```

### 5. Run the App

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

### 6. Pair with Your Partner

1. Both of you create accounts in the app
2. One person goes to **Settings > Generate Code**
3. The other enters the code in **Settings > Enter Partner's Code**
4. Start buzzing!

## Project Structure

```
app/                    # Expo Router screens
  _layout.js            # Root layout (auth guard + buzz listener)
  (auth)/               # Login & signup screens
  (app)/                # Main app tabs (buzz, history, settings)
src/
  components/           # Reusable UI components
  config/               # Supabase client setup
  contexts/             # React context (auth + partner state)
  services/             # Business logic (haptics, notifications, buzzes)
  theme/                # Colors and design tokens
supabase/
  migrations/           # SQL schema
  functions/            # Edge Functions (push notification sender)
```
