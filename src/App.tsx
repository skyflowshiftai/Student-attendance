import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { AIOperationsPage } from '@/pages/AIOperationsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { AttendanceHistoryPage } from '@/pages/AttendanceHistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageId } from '@/types';

export default function App() {
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

  return (
    <AppShell activePage={activePage} onNavigate={navigate}>
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
