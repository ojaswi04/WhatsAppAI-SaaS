import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'http://localhost:54321'; // fallback URL
const supabaseAnonKey = import.meta.env.SUPABASE_KEY || 'dummy_key'; // fallback key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email, password, businessName, currency = '₹', whatsappNumber = '') {
  // 1. Insert into app_tenants FIRST (before signup)
  const { data: tenantData, error: tenantError } = await supabase
    .from('app_tenants')
    .insert([
      {
        business_name: businessName,
        currency: currency,
        whatsapp_number: whatsappNumber || null,
        active: true
      }
    ])
    .select('tenant_id');

  if (tenantError) {
    alert(`DB Insert Error: ${tenantError.message}`);
    throw new Error(`Failed to setup business profile: ${tenantError.message}`);
  }

  if (!tenantData || tenantData.length === 0) {
    const msg = "Insert succeeded, but Supabase returned no rows! RLS might be blocking read access.";
    alert(msg);
    throw new Error(msg);
  }

  const newTenantId = tenantData[0].tenant_id;

  // 2. Sign up the user and directly embed the newTenantId in their metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tenant_id: newTenantId
      }
    }
  });

  if (authError) throw authError;

  if (!authData.user) {
    throw new Error('Sign up failed: No user returned.');
  }

  return { user: authData.user, tenantId: newTenantId };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
