import { supabase } from '@/lib/supabase';

type ErrorDetails = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
};

function getErrorDetails(error: unknown): ErrorDetails {
  if (typeof error === 'object' && error !== null) return error as ErrorDetails;
  return { message: error };
}

export function isExpiredAdminSession(error: unknown) {
  const details = getErrorDetails(error);
  const message = typeof details.message === 'string' ? details.message : String(error);
  return details.code === 'PGRST301'
    || details.status === 401
    || details.status === '401'
    || details.statusCode === '401'
    || /jwt expired|invalid jwt|session.*expired/i.test(message);
}

export async function clearExpiredAdminSession() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}
