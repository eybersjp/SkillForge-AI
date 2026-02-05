
import React, { useState } from 'react';
import { AppStep, ProjectMetadata, Skill } from './types';
import { generateSkills, GenerationError } from './services/geminiService';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import SkillReview from './components/SkillReview';
import ExportStep from './components/ExportStep';
import LoadingState from './components/LoadingState';
import Documentation from './components/Documentation';
import LiveAgent from './components/LiveAgent';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [step, setStep] = useState<AppStep>('input');
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    idea: '',
    packageName: '',
    version: '1.0.0',
    author: 'AI Forge',
    description: ''
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const handleStartGeneration = async (data: ProjectMetadata) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setMetadata(data);
    setIsGenerating(true);
    setStep('generating');
    setError(null);
    
    try {
      const generated = await generateSkills(data);
      setSkills(generated);
      setStep('review');
    } catch (err: any) {
      const message = err instanceof GenerationError 
        ? err.message 
        : "Failed to generate skills. Please check your connection and try again.";
      
      setError(message);
      setStep('input');
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSkill = (updatedSkill: Skill) => {
    setSkills(prev => prev.map(s => s.id === updatedSkill.id ? updatedSkill : s));
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const handleApprove = () => {
    setStep('export');
  };

  const navigateToDocs = () => {
    setStep('documentation');
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToGallery = () => {
    setStep('gallery');
    setView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setView('landing');
    setStep('input');
  };

  const toggleAgent = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsAgentOpen(!isAgentOpen);
  };

  const handleApplyAgentIdea = (newIdea: string) => {
    setMetadata(prev => ({ ...prev, idea: newIdea }));
  };

  const handleRestoreProject = (newMetadata: ProjectMetadata, newSkills: Skill[]) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setView('app');
    setMetadata(newMetadata);
    setSkills(newSkills);
    setStep('review');
  };

  const handleForkGalleryItem = (newMetadata: ProjectMetadata, newSkills: Skill[]) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setView('app');
    setMetadata(newMetadata);
    setSkills(newSkills);
    setStep('review');
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    setMetadata(prev => ({ ...prev, author: userData.name }));
  };

  const handleGetStarted = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setView('app');
    setStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setStep('input');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header 
        onShowDocs={navigateToDocs} 
        onShowGallery={navigateToGallery}
        onHome={navigateToHome} 
        onLogin={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
      />
      
      {view === 'landing' ? (
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onShowDocs={navigateToDocs}
          isAuthenticated={!!user}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-12">
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
            {step === 'input' && (
              <IdeaInput 
                onStart={handleStartGeneration} 
                onConnectAgent={toggleAgent} 
                onRestore={handleRestoreProject}
                initialIdea={metadata.idea}
              />
            )}

            {step === 'generating' && (
              <LoadingState />
            )}

            {step === 'review' && (
              <SkillReview 
                metadata={metadata}
                skills={skills} 
                onUpdate={handleUpdateSkill}
                onDelete={handleDeleteSkill}
                onApprove={handleApprove}
                onBack={() => setStep('input')}
              />
            )}

            {step === 'export' && (
              <ExportStep 
                metadata={metadata} 
                skills={skills} 
                onBack={() => setStep('review')}
              />
            )}

            {step === 'documentation' && (
              <Documentation onBack={() => {
                if (user) setStep('input'); else setView('landing');
              }} />
            )}

            {step === 'gallery' && (
              <Gallery 
                onFork={handleForkGalleryItem}
                onBack={() => {
                  if (user) setStep('input'); else setView('landing');
                }}
              />
            )}
          </div>
        </main>
      )}

      <LiveAgent 
        isOpen={isAgentOpen} 
        onClose={() => setIsAgentOpen(false)} 
        currentIdea={metadata.idea}
        onApplyIdea={handleApplyAgentIdea}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />

      <footer className="mt-20 border-t border-slate-800 py-10 text-center text-slate-500 text-sm">
        Built with Gemini 3 Pro & React • 2024 SkillForge AI
      </footer>
    </div>
  );
};

export default App;
