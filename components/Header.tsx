
import React from 'react';

interface Props {
  onShowDocs: () => void;
  onShowGallery: () => void;
  onHome: () => void;
  onLogin: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

const Header: React.FC<Props> = ({ onShowDocs, onShowGallery, onHome, onLogin, user, onLogout }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={onHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            SkillForge AI
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={onShowGallery}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Gallery
          </button>
          <button 
            onClick={onShowDocs}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Documentation
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300">{user.name}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-slate-800 rounded-full text-xs font-semibold hover:bg-slate-700 transition-colors text-white"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
