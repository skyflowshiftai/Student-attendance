import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageId } from '@/types';

interface AppShellProps {
  children: React.ReactNode;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const breadcrumbMap: Record<PageId, string> = {
  'dashboard': 'Dashboard',
  'attendance': 'Take Attendance',
  'ai-operations': 'AI Operations',
  'students': 'Students Directory',
  'history': 'Attendance History',
  'settings': 'System Settings',
};

export function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          breadcrumb={breadcrumbMap[activePage]}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
