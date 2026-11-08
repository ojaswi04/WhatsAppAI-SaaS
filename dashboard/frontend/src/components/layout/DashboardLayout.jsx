import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const location = useLocation();
  const getTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/chats': return 'Chats';
      case '/customers': return 'Customers';
      case '/catalog': return 'Catalog';
      case '/campaigns': return 'Campaigns';
      case '/analytics': return 'Analytics';
      case '/settings': return 'Settings';
      default: return 'WhatsappAI';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden selection:bg-green-100 selection:text-green-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        
        <Header title={getTitle(location.pathname)} />
        
        <main className="flex-1 overflow-y-auto p-8 relative z-0">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
