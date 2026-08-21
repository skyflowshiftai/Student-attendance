import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Zap, ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Fixed credentials: Name: AI campuspulse, Password: AIcampuspulse
      if ((cleanUser === 'ai campuspulse' || cleanUser === 'campuspulse' || cleanUser === 'admin') && cleanPass === 'AIcampuspulse') {
        localStorage.setItem(
          'campuspulse_auth',
          JSON.stringify({
            name: 'AI campuspulse',
            role: 'Faculty / Admin',
            authenticated: true,
            timestamp: Date.now(),
          })
        );
        onLogin();
      } else {
        setError('Invalid credentials. Please enter authorized username and password.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-black tracking-tight">CampusPulse</h1>
            <p className="text-xs text-neutral-500 font-medium">Autonomous Telecall & Attendance Portal</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Sign in</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Institutional authentication required to access live attendance and voice telecalling operations.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-neutral-100 border border-neutral-300 text-xs font-semibold text-black">
            <AlertCircle className="h-4 w-4 shrink-0 text-black" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-1.5">
              User / Faculty Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                placeholder="AI campuspulse"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-9 pr-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 text-black placeholder:text-neutral-400 focus-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-3 text-sm rounded-xl border border-neutral-200 bg-neutral-50 text-black placeholder:text-neutral-400 focus-ring"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2 h-11 bg-black text-white hover:bg-neutral-800 font-semibold"
          >
            Authenticate & Enter
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
            256-bit Encrypted
          </span>
          <span>NSRIT Autonomous v2.0</span>
        </div>
      </div>
    </div>
  );
}
