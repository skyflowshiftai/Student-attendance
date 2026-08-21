import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardCheck,
  Bot,
  GraduationCap,
  History,
  Settings,
  Zap,
  PhoneCall,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { PageId } from '@/types';

interface NavItem {
  label: string;
  icon: React.ElementType;
  page: PageId;
  badge?: string;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
  { label: 'Take Attendance', icon: ClipboardCheck, page: 'attendance' },
  { label: 'AI Operations', icon: Bot, page: 'ai-operations', badge: 'Live' },
  { label: 'Students Directory', icon: GraduationCap, page: 'students' },
  { label: 'Attendance History', icon: History, page: 'history' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ isOpen, onClose, activePage, onNavigate }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-[260px] bg-white border-r border-neutral-200',
          'flex flex-col transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-black tracking-tight flex items-center gap-1.5">
                CampusPulse
                <span className="text-[10px] px-1.5 py-0.2 font-semibold bg-neutral-100 text-black rounded border border-neutral-300">
                  v2.0
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase">
                NSRIT Autonomous
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Core Modules
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.page === activePage;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer',
                  isActive
                    ? 'bg-black text-white font-semibold'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-white' : 'text-neutral-500')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider',
                    isActive ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black'
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Agent Status Widget (Monochrome) */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-neutral-50 border border-neutral-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-black"></span>
            <span className="text-[11px] font-bold text-black">Ravi Kumar (AI Agent)</span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Cartesia Neural Voice Active · +1 949 738 5095
          </p>
        </div>

        {/* Bottom Settings Link */}
        <div className="px-3 pb-4 border-t border-neutral-200 pt-3">
          <button
            onClick={() => {
              onNavigate('settings');
              onClose();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-default text-left cursor-pointer',
              activePage === 'settings'
                ? 'bg-black text-white font-semibold'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            )}
          >
            <Settings className="h-[18px] w-[18px] text-neutral-500" />
            System Settings
          </button>
        </div>
      </aside>
    </>
  );
}
