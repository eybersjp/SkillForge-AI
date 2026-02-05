
import React, { useState, useEffect, useRef } from 'react';
import { ProjectMetadata, Skill } from '../types';
import { parseSkillPackage } from '../services/zipParser';

interface Props {
  onStart: (data: ProjectMetadata) => void;
  onConnectAgent: () => void;
  onRestore: (metadata: ProjectMetadata, skills: Skill[]) => void;
  initialIdea?: string;
}

const IdeaInput: React.FC<Props> = ({ onStart, onConnectAgent, onRestore, initialIdea }) => {
  const [idea, setIdea] = useState(initialIdea || '');
  const [packageName, setPackageName] = useState('');
  const [author, setAuthor] = useState('DevUser');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialIdea) {
      setIdea(initialIdea);
    }
  }, [initialIdea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !packageName) return;

    onStart({
      idea,
      packageName: packageName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      author,
      description: `AI Agent skills for ${idea}`
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { metadata, skills } = await parseSkillPackage(file);
      onRestore(metadata, skills);
    } catch (err: any) {
      alert("Error parsing skill package: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          What will your <span className="text-indigo-500">Agent</span> do?
        </h1>
        <p className="text-slate-400 text-lg">
          Describe a capability, or upload a previous project to refine it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".zip" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-bold hover:bg-slate-700 transition-all"
          >
            {isUploading ? 'Parsing...' : 'Upload .zip'}
          </button>
          <button
            type="button"
            onClick={onConnectAgent}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold hover:bg-indigo-600/20 transition-all group"
          >
            <svg className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Tell me your idea
          </button>
        </div>

        <div className="space-y-2 pt-8">
          <label className="text-sm font-medium text-slate-300">The Idea</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
            placeholder="e.g. A personal finance assistant that analyzes spending patterns and suggests budget optimizations..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Package Name</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="my-agent-skills"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Your Name"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!idea || !packageName}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
        >
          Forge Skills
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-indigo-400 font-bold text-xl mb-1">1. Ideate</div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Define the goal</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-indigo-400 font-bold text-xl mb-1">2. Forge</div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Gemini Generates Code</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="text-indigo-400 font-bold text-xl mb-1">3. Deploy</div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Install as NPX</p>
        </div>
      </div>
    </div>
  );
};

export default IdeaInput;
