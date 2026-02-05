
import React, { useState } from 'react';

interface Props {
  onGetStarted: () => void;
  onShowDocs: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted, onShowDocs, isAuthenticated, onOpenAuth }) => {
  const [demoIdea, setDemoIdea] = useState('');
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<string[] | null>(null);

  const handleRunDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoIdea) return;
    
    setIsDemoRunning(true);
    setDemoResult(null);
    
    // Purely visual demo
    setTimeout(() => {
      setIsDemoRunning(false);
      setDemoResult([
        'fetchFinancialData(apiKey, period)',
        'analyzeSpendingPatterns(data)',
        'generateOptimizationReport(patterns)',
        'notifyUser(message)'
      ]);
    }, 2000);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Now in Public Preview
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-top-6 duration-1000">
            Forge AI Agent Skills <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500">
              In Seconds, Not Days.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            The world's first conversational IDE for building production-ready AI agent toolkits. Describe your idea, refine with voice, and export as a type-safe NPM package.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all hover:-translate-y-1 active:scale-95 text-lg"
            >
              {isAuthenticated ? 'Open Workspace' : 'Start Forging Free'}
            </button>
            <button 
              onClick={onShowDocs}
              className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-lg"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Demo Playground */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-1 overflow-hidden">
          <div className="bg-slate-950/80 rounded-[2.3rem] p-8 md:p-12 space-y-10">
            <div className="text-center space-y-3">
              <div className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg inline-block text-[10px] font-bold uppercase tracking-widest">
                Interactive Playground
              </div>
              <h2 className="text-3xl font-bold text-white">Experience the Magic</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">Enter an idea below to see how SkillForge architects your agent's capabilities instantly.</p>
            </div>

            <form onSubmit={handleRunDemo} className="relative group">
               <input 
                 type="text" 
                 value={demoIdea}
                 onChange={(e) => setDemoIdea(e.target.value)}
                 placeholder="e.g. A crypto trading agent that scans Twitter trends..."
                 className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-32"
               />
               <button 
                type="submit"
                disabled={isDemoRunning || !demoIdea}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
               >
                 {isDemoRunning ? 'Forging...' : 'Try Demo'}
               </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[160px]">
              {isDemoRunning ? (
                <div className="col-span-2 flex items-center justify-center gap-4 animate-pulse">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-500 font-mono text-sm tracking-widest uppercase">Architecting Blueprint...</span>
                </div>
              ) : demoResult ? (
                <>
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generated Skills</h4>
                    <div className="space-y-2">
                      {demoResult.map((skill, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span className="font-mono text-sm text-indigo-300">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">To export this package and view full implementation logic, please join the forge.</p>
                    <button 
                      onClick={onOpenAuth}
                      className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all text-sm"
                    >
                      Unlock Full Access
                    </button>
                  </div>
                </>
              ) : (
                <div className="col-span-2 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 text-sm italic">
                  Enter an idea above to see a preview of the generated skillset.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Hook: Terminal Preview */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="relative group animate-in fade-in zoom-in duration-1000 delay-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <span className="text-xs font-mono text-slate-500">zsh — npx @forge/my-skills</span>
              <div className="w-10"></div>
            </div>
            <div className="p-8 font-mono text-sm space-y-4">
              <div className="flex gap-3">
                <span className="text-indigo-500">$</span>
                <span className="text-slate-300">npx install -g @forge/financial-agent</span>
              </div>
              <div className="text-slate-500 ml-6">
                [info] Downloading package...<br/>
                [info] Registering 'skillforge' alias...<br/>
                [success] Installed successfully!
              </div>
              <div className="flex gap-3 pt-2">
                <span className="text-indigo-500">$</span>
                <span className="text-slate-300">skillforge analyze-spending --args '{"month": "July"}'</span>
              </div>
              <div className="text-indigo-400 ml-6">
                🚀 Executing SkillForge Core...<br/>
                ✅ Result: spending_patterns_resolved.json
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="pb-24 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-10">Trusted by Developers at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="text-2xl font-black text-white tracking-tighter italic">VECTA</div>
             <div className="text-2xl font-black text-white tracking-tighter">CLOUDCORE</div>
             <div className="text-2xl font-black text-white tracking-tighter">NEURAL_X</div>
             <div className="text-2xl font-black text-white tracking-tighter italic">LUMINA</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white">Conversational Refinement</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Use Gemini Live to speak your idea. Our agent will listen, ask clarifying questions, and refine your logic before a single line of code is generated.
              </p>
            </div>
            <div className="mt-8 p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-400">
              User: "I need it to handle bank CSVs too."<br/>
              Agent: "Updating blueprint to include parseCSV(file) skill..."
            </div>
          </div>
          
          <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[2.5rem] text-white flex flex-col justify-center">
             <h3 className="text-4xl font-black mb-4">98%</h3>
             <p className="text-lg opacity-90 font-medium">Faster integration than manual tool definition for AI Agents.</p>
          </div>

          <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] hover:border-violet-500/30 transition-all">
            <div className="w-12 h-12 bg-violet-600/20 text-violet-400 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-1.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Type Safe Runtime</h3>
            <p className="text-slate-400 text-sm">Every skill is exported with strict parameter validation, preventing agent hallucination at the source.</p>
          </div>

          <div className="md:col-span-8 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4">
               <h3 className="text-2xl font-bold text-white">Universal Agent Support</h3>
               <p className="text-slate-400 text-sm">The <code>toolManifest</code> export works seamlessly with LangChain, Autogen, CrewAI, and the Gemini API.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">AutoGPT</div>
               <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">BabyAGI</div>
               <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">OpenAI</div>
               <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">Gemini SDK</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 bg-indigo-600 rounded-[3rem] p-16 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to empower your Agents?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-lg mx-auto">Join thousands of engineers building the next generation of autonomous tools.</p>
          <button 
            onClick={isAuthenticated ? onGetStarted : onOpenAuth}
            className="px-12 py-5 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all text-xl"
          >
            {isAuthenticated ? 'Enter Workspace' : 'Start Forging Now'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
