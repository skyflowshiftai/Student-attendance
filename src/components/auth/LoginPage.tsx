import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Zap, ShieldCheck, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Fixed credentials: Name: AIcampuspulse, Password: AI@9999
      const isUserValid =
        cleanUser === 'aicampuspulse' ||
        cleanUser === 'ai campuspulse' ||
        cleanUser === 'campuspulse' ||
        cleanUser === 'admin';

      const isPassValid =
        cleanPass === 'AI@9999' ||
        cleanPass === 'ai@9999';

      if (isUserValid && isPassValid) {
        localStorage.setItem(
          'campuspulse_auth',
          JSON.stringify({
            name: 'AIcampuspulse',
            role: 'Faculty / Admin',
            authenticated: true,
            timestamp: Date.now(),
          })
        );
        onLogin();
      } else {
        setError('Invalid credentials. Please enter Name: AIcampuspulse and Password: AI@9999');
        setLoading(false);
      }
    }, 300);
  };

  const handleFillCredentials = () => {
    setUsername('AIcampuspulse');
    setPassword('AI@9999');
    setError(null);
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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="AIcampuspulse"
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
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="AI@9999"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-9 pr-10 text-sm rounded-xl border border-neutral-200 bg-neutral-50 text-black placeholder:text-neutral-400 focus-ring font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2 h-11 bg-black text-white hover:bg-neutral-800 font-semibold cursor-pointer"
          >
            Authenticate & Enter
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Quick Demo Credentials Hint */}
        <div className="mt-5 p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-black">Login Credentials:</p>
            <p className="text-[11px] text-neutral-600 font-mono mt-0.5 font-bold">AIcampuspulse · AI@9999</p>
          </div>
          <button
            type="button"
            onClick={handleFillCredentials}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Auto Fill
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
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
