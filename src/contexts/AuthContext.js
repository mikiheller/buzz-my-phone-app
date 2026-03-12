import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { registerForPushNotifications } from '../services/notifications';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setPartner(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(prof);

      if (prof?.partner_id) {
        const { data: partnerProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', prof.partner_id)
          .single();
        setPartner(partnerProf);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName,
        email,
      });

      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await supabase
          .from('profiles')
          .update({ push_token: pushToken })
          .eq('id', data.user.id);
      }
    }

    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const pushToken = await registerForPushNotifications();
    if (pushToken) {
      await supabase
        .from('profiles')
        .update({ push_token: pushToken })
        .eq('id', data.user.id);
    }

    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPartner(null);
  }

  async function generatePairCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase
      .from('profiles')
      .update({ pair_code: code, pair_code_expires: expiresAt })
      .eq('id', user.id);

    setProfile((prev) => ({ ...prev, pair_code: code, pair_code_expires: expiresAt }));
    return code;
  }

  async function joinWithCode(code) {
    const { data: partnerProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('pair_code', code.toUpperCase())
      .gt('pair_code_expires', new Date().toISOString())
      .single();

    if (error || !partnerProfile) {
      throw new Error('Invalid or expired code. Ask your partner for a new one.');
    }

    if (partnerProfile.id === user.id) {
      throw new Error("You can't pair with yourself!");
    }

    await supabase
      .from('profiles')
      .update({ partner_id: partnerProfile.id, pair_code: null, pair_code_expires: null })
      .eq('id', user.id);

    await supabase
      .from('profiles')
      .update({ partner_id: user.id, pair_code: null, pair_code_expires: null })
      .eq('id', partnerProfile.id);

    setPartner(partnerProfile);
    setProfile((prev) => ({ ...prev, partner_id: partnerProfile.id }));
  }

  async function unpair() {
    if (!partner) return;

    await supabase
      .from('profiles')
      .update({ partner_id: null })
      .eq('id', user.id);

    await supabase
      .from('profiles')
      .update({ partner_id: null })
      .eq('id', partner.id);

    setPartner(null);
    setProfile((prev) => ({ ...prev, partner_id: null }));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        partner,
        loading,
        signUp,
        signIn,
        signOut,
        generatePairCode,
        joinWithCode,
        unpair,
        loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
