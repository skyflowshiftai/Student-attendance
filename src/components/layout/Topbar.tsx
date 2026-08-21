import React, { useEffect } from 'react';
import { Bell, Menu, ChevronRight } from 'lucide-react';
import { currentFaculty } from '@/data/institutionConfig';

interface TopbarProps {
  onMenuClick: () => void;
  breadcrumb: string;
}

export function Topbar({ onMenuClick, breadcrumb }: TopbarProps) {
  // Ensure dark class is completely cleared
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const initials = currentFaculty.name
    .split(' ')
    .filter(n => n.length > 1)
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted lg:hidden transition-default cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <span className="text-muted-foreground">Campus</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="font-medium text-foreground">{breadcrumb}</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg hover:bg-muted transition-default cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">{currentFaculty.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{currentFaculty.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
