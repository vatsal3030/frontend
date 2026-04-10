"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/dashboard');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) setError(error.message);
    else setError('Registration successful. You can log in now!');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="bg-brutal-mint">
            <CardTitle>Create Account</CardTitle>
            <CardDescription className="text-brutal-black">Start analyzing resumes instantly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {error && (
              <div className={`p-3 border-3 border-brutal-black font-bold shadow-brutal-sm ${error.includes('successful') ? 'bg-brutal-blue' : 'bg-red-400'}`}>
                {error}
              </div>
            )}

            <Button variant="white" className="w-full text-lg gap-2" onClick={handleGoogleLogin}>
               <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
               </svg>
               Google Sign-Up
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-3 border-brutal-black"></div>
              <span className="shrink-0 px-4 font-bold text-sm bg-brutal-yellow border-3 border-brutal-black rounded-full mx-2 shadow-[2px_2px_0px_#000]">OR</span>
              <div className="flex-grow border-t-3 border-brutal-black"></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-black">Full Name</label>
                <Input type="text" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-black">Email</label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-black">Password</label>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" variant="default" className="w-full text-lg mt-4">
                Create Account
              </Button>
            </form>

            <p className="text-center font-bold pb-2 pt-4">
              Already have an account? <Link href="/login" className="bg-brutal-pink px-2 py-1 border-2 border-brutal-black hover:bg-brutal-yellow transition-colors shadow-[2px_2px_0px_#000]">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
