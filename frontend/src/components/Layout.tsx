import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Header />
        
        {/* Dynamic page container */}
        <main className="p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
