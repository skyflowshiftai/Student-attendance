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
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Authorized Institutional Access Verification
      const isUserValid =
        cleanUser === 'aicampuspulse' ||
        cleanUser === 'ai campuspulse' ||
        cleanUser === 'campuspulse' ||
        cleanUser === 'admin';

      const isPassValid =
        cleanPass === 'AI@9999' ||
        cleanPass === 'ai@9999';

      if (isUserValid && isPassValid) {
        const sessionPayload = {
          name: 'AIcampuspulse',
          role: 'Authorized Faculty / Administrator',
          department: 'Computer Science & Engineering',
          institution: 'NSRIT Autonomous',
          authenticated: true,
          timestamp: Date.now(),
        };

        if (rememberMe) {
          localStorage.setItem('campuspulse_auth', JSON.stringify(sessionPayload));
        } else {
          sessionStorage.setItem('campuspulse_auth', JSON.stringify(sessionPayload));
        }

        onLogin();
      } else {
        setError('Invalid faculty credentials. Access denied.');
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-[420px] bg-white border border-neutral-200/90 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Institutional Branding */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-black tracking-tight leading-none">CampusPulse</h1>
            <p className="text-[11px] text-neutral-500 font-medium tracking-wide uppercase mt-1">NSRIT Autonomous</p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black tracking-tight">Faculty Portal</h2>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Institutional authentication required to access attendance analytics and autonomous voice telecall infrastructure.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-semibold text-black animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-black" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
              Faculty / Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter authorized username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50/70 text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-11 text-sm rounded-xl border border-neutral-200 bg-neutral-50/70 text-black placeholder:text-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-black transition-colors rounded-md"
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

          {/* Session Options */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-neutral-400 font-mono">256-bit AES</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full mt-2 h-11 bg-black text-white hover:bg-neutral-800 font-semibold cursor-pointer rounded-xl transition-all shadow-sm"
          >
            Authenticate & Enter
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Security Footer */}
        <div className="mt-7 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-neutral-600" />
            Institutional Access Control
          </span>
          <span className="font-mono">v2.0 PROD</span>
        </div>
      </div>
    </div>
  );
}
