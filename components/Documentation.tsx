
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
}

const Documentation: React.FC<Props> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const navItems = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'ide-integration', label: 'IDE & Agent Integration' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'mcp-support', label: 'MCP (Model Context Protocol)' },
    { id: 'cli-reference', label: 'CLI Reference' },
    { id: 'best-practices', label: 'Production Best Practices' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 pb-8 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">v1.1.0 Stable</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Enterprise Ready</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Blueprint</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl">Integrate forged skills into Cursor, Claude Code, Antigravity, and production Agent runtimes.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-sm font-semibold shadow-xl self-start md:self-center"
        >
          Return to Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 sticky top-24 h-fit hidden lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id 
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-24 pb-32">
          
          {/* Getting Started */}
          <section id="getting-started" className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Getting Started</h2>
            <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed space-y-4">
              <p>
                SkillForge generates production-grade TypeScript toolsets that can be consumed as standard Node modules or injected directly into AI agent system prompts. Every package includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-500">
                <li>Strict Runtime Validation (Type and Schema)</li>
                <li>High-precision performance logging and telemetry</li>
                <li>Universal JSON-manifest for Agent discovery</li>
                <li>CLI wrapper for manual testing and debugging</li>
              </ul>
            </div>
          </section>

          {/* IDE Integration */}
          <section id="ide-integration" className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">IDE & Agent Integration</h2>
              <p className="text-slate-400">Deploy your forged skills to the world's leading AI development environments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cursor */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg">⌘</div>
                  <h3 className="font-bold text-white">Cursor / Windsurf</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Add the generated <code>toolManifest</code> to your <b>.cursorrules</b> or <b>System Prompt</b>. Use the <code>skillforge</code> CLI to execute logic within the terminal.
                </p>
              </div>

              {/* Claude Code */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 group hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-600/20 text-violet-400 rounded-lg flex items-center justify-center text-lg">C</div>
                  <h3 className="font-bold text-white">Claude Code</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inject tools as MCP servers. Claude Code natively supports executing terminal commands via forged CLI toolsets.
                </p>
              </div>

              {/* Copilot */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 group hover:border-sky-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-600/20 text-sky-400 rounded-lg flex items-center justify-center text-lg">G</div>
                  <h3 className="font-bold text-white">GitHub Copilot</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Leverage Copilot Extensions or local <b>Custom Instructions</b>. Provide the manifest to allow Copilot to suggest tool-calling syntax.
                </p>
              </div>

              {/* Antigravity */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 group hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600/20 text-orange-400 rounded-lg flex items-center justify-center text-lg">A</div>
                  <h3 className="font-bold text-white">Antigravity / Autogen</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Natively register tools into the Antigravity skill library. The exported <code>index.ts</code> follows standard function-calling patterns used in multi-agent orchestration.
                </p>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Architecture Deep Dive</h2>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-6">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Runtime Stack</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-bold text-white">Type-Safe Dispatcher</p>
                    <p className="text-xs text-slate-500">Uses high-precision timing (ms) and ISO-8601 logging for distributed system monitoring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-bold text-white">Atomic Tool Isolation</p>
                    <p className="text-xs text-slate-500">Each skill is context-free, allowing for parallel execution in swarm architectures.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MCP Support */}
          <section id="mcp-support" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">MCP Support</h2>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Native Bridge</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Model Context Protocol (MCP) is the new standard for giving agents access to local data and tools. To use your package as an MCP server:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-xs space-y-4">
              <div className="text-slate-500"># Install the bridge globally</div>
              <div className="text-indigo-400">npm install -g @skillforge/mcp-bridge</div>
              <div className="text-slate-500"># Connect your forged package</div>
              <div className="text-indigo-400">mcp-bridge register ./path/to/forged-package</div>
            </div>
          </section>

          {/* Best Practices */}
          <section id="best-practices" className="space-y-12">
            <h2 className="text-3xl font-bold text-white">Production Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <h4 className="text-sm font-bold text-white">Telemetry & Observation</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">SkillForge logs are formatted to be easily ingested by Datadog, ELK, or CloudWatch. Use <code>STDOUT</code> redirection for production monitoring.</p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-sm font-bold text-white">Versioning (SemVer)</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">Always increment the version in the UI before re-exporting. Agents cached on older schemas may hallucinate parameters if breaking changes occur.</p>
               </div>
            </div>
          </section>

          {/* CTA Footer */}
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
            <h2 className="text-3xl font-black text-white">Ready for Deployment?</h2>
            <p className="text-indigo-100 max-w-lg mx-auto text-lg leading-relaxed">
              The forge awaits your next production-ready toolkit.
            </p>
            <button 
              onClick={onBack}
              className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              Back to Workspace
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Documentation;
