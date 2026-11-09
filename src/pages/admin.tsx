import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LogOut, LockKeyhole } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type AdminAccess = 'checking' | 'allowed' | 'denied' | 'failed';

function signInMessage(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return 'That email and password combination is not recognized. Please try again.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'This email address has not been confirmed. Please contact the site owner.';
  }
  if (/rate limit/i.test(message)) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  return 'We could not sign you in. Please check your details and try again.';
}

export default function AdminPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState<AdminAccess>('checking');
  const [accessError, setAccessError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const checkSequence = useRef(0);

  const checkAdmin = useCallback(async (nextSession: Session | null) => {
    const sequence = ++checkSequence.current;
    setSession(nextSession);
    setAccessError('');
    if (!nextSession) {
      setAccess('checking');
      return;
    }

    setAccess('checking');
    const { data, error } = await supabase.rpc('is_admin');
    if (sequence !== checkSequence.current) return;
    if (error) {
      if (error.message.includes('JWT') || error.message.toLowerCase().includes('token')) {
        await supabase.auth.signOut();
        return;
      }
      setAccessError('We could not verify your admin access. Please try again.');
      setAccess('failed');
      return;
    }
    setAccess(data === true ? 'allowed' : 'denied');
  }, []);

  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex, nofollow');
    if (!robots.parentNode) document.head.appendChild(robots);
    const previousTitle = document.title;
    document.title = 'Admin | Olajumoke Peculiar Signature';

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAccessError('Your session could not be loaded. Please sign in again.');
        setAccess('failed');
        return;
      }
      void checkAdmin(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void checkAdmin(nextSession);
    });
    return () => {
      active = false;
      checkSequence.current += 1;
      subscription.unsubscribe();
      robots.setAttribute('content', 'index, follow');
      document.title = previousTitle;
    };
  }, [checkAdmin]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSigningIn(false);
    if (error) {
      toast({ title: 'Unable to sign in', description: signInMessage(error.message), variant: 'destructive' });
      return;
    }
    setPassword('');
    toast({ title: 'Signed in', description: 'Checking your admin access.' });
    void checkAdmin(data.session);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    if (error) {
      toast({ title: 'Could not sign out', description: 'Please try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Signed out' });
  };

  const retryAccess = () => {
    void checkAdmin(session);
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="eyebrow">Olajumoke Peculiar Signature</p>
            <h1 className="serif mt-1 text-3xl font-medium">Product studio</h1>
          </div>
          {session && (
            <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
              <LogOut aria-hidden="true" />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          )}
        </header>

        {!session && access === 'checking' ? (
          <div className="mx-auto max-w-md space-y-4" aria-label="Checking session">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !session ? (
          <section className="mx-auto max-w-md rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <LockKeyhole aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 className="serif text-2xl">Admin sign in</h2>
                <p className="text-sm text-muted-foreground">Sign in with your admin account.</p>
              </div>
            </div>
            {access === 'failed' && (
              <Alert variant="destructive" className="mb-5">
                <AlertTitle>Session unavailable</AlertTitle>
                <AlertDescription>{accessError}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-5" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={signingIn} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={signingIn} />
              </div>
              <Button className="w-full" type="submit" disabled={signingIn}>
                {signingIn ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </section>
        ) : access === 'checking' ? (
          <div className="space-y-4" aria-label="Checking admin access">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : access === 'failed' ? (
          <Alert variant="destructive" className="max-w-xl">
            <AlertTitle>Could not verify access</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{accessError}</span>
              <Button type="button" variant="outline" onClick={retryAccess}>Try again</Button>
            </AlertDescription>
          </Alert>
        ) : access === 'denied' ? (
          <section className="max-w-xl rounded-lg border border-border bg-card p-6">
            <h2 className="serif text-3xl">You don&apos;t have access</h2>
            <p className="mt-2 text-sm text-muted-foreground">This account is not permitted to manage products.</p>
          </section>
        ) : (
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="serif text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your product dashboard is ready.</p>
          </section>
        )}
      </div>
    </main>
  );
}
