import React, { useEffect } from 'react';
import { Bell, Menu, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  breadcrumb: string;
  onLogout?: () => void;
}

export function Topbar({ onMenuClick, breadcrumb, onLogout }: TopbarProps) {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6 shadow-2xs">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 lg:hidden transition-default cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-neutral-600" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <span className="text-neutral-400">Campus</span>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
          <span className="font-semibold text-black">{breadcrumb}</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-black">
          <ShieldCheck className="h-3.5 w-3.5 text-black" />
          <span className="hidden sm:inline">Authenticated</span>
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
            CP
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-black leading-tight">AI campuspulse</p>
            <p className="text-[10px] text-neutral-500 leading-tight">NSRIT Faculty</p>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 ml-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-default cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
