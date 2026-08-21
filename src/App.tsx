import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { AIOperationsPage } from '@/pages/AIOperationsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { AttendanceHistoryPage } from '@/pages/AttendanceHistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoginPage } from '@/components/auth/LoginPage';
import { PageId } from '@/types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('campuspulse_auth');
      return Boolean(auth && JSON.parse(auth).authenticated);
    } catch {
      return false;
    }
  });

  const getPageFromHash = (): PageId => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validPages: PageId[] = ['dashboard', 'attendance', 'ai-operations', 'students', 'history', 'settings'];
    return validPages.includes(hash as PageId) ? (hash as PageId) : 'attendance';
  };

  const [activePage, setActivePage] = useState<PageId>(getPageFromHash);

  useEffect(() => {
    const handleHash = () => setActivePage(getPageFromHash());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (page: PageId) => {
    window.location.hash = `#/${page}`;
    setActivePage(page);
  };

  const handleLogout = () => {
    localStorage.removeItem('campuspulse_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppShell activePage={activePage} onNavigate={navigate} onLogout={handleLogout}>
      <ErrorBoundary fallbackTitle={`Error Loading ${activePage}`}>
        {activePage === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {activePage === 'attendance' && (
          <AttendancePage
            onNavigateToOperations={() => navigate('ai-operations')}
            onNavigateToStudents={() => navigate('students')}
          />
        )}
        {activePage === 'ai-operations' && <AIOperationsPage />}
        {activePage === 'students' && <StudentsPage />}
        {activePage === 'history' && <AttendanceHistoryPage />}
        {activePage === 'settings' && <SettingsPage />}
      </ErrorBoundary>
    </AppShell>
  );
}
