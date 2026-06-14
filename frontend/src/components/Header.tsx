import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  // Determine page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/leads':
        return 'Leads Management';
      case '/settings':
        return 'Settings';
      default:
        if (location.pathname.startsWith('/leads/')) {
          return 'Lead Qualification';
        }
        return 'QualiAI';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <h1 className="text-xl font-bold text-slate-100 tracking-tight">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        {/* Public Lead Form quick shortcut */}
        <Link
          to="/lead"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-brand-500/10 transition-all duration-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Launch Lead Form</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </header>
  );
};
export default Header;
