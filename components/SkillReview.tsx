
import React, { useState } from 'react';
import { Skill, ProjectMetadata, Parameter } from '../types';

interface Props {
  metadata: ProjectMetadata;
  skills: Skill[];
  onUpdate: (skill: Skill) => void;
  onDelete: (id: string) => void;
  onApprove: () => void;
  onBack: () => void;
}

const SkillReview: React.FC<Props> = ({ metadata, skills, onUpdate, onDelete, onApprove, onBack }) => {
  const [activeSkillId, setActiveSkillId] = useState<string | null>(skills[0]?.id || null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDesc, setBatchDesc] = useState('');

  const activeSkill = skills.find(s => s.id === activeSkillId) || null;
  const isBatchMode = selectedIds.size > 1;

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
    if (next.size === 1) {
      setActiveSkillId(Array.from(next)[0]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === skills.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(skills.map(s => s.id)));
    }
  };

  const handleUpdateActiveDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeSkill) {
      onUpdate({ ...activeSkill, toolDescription: e.target.value });
    }
  };

  const applyBatchDescription = () => {
    if (!batchDesc) return;
    skills.filter(s => selectedIds.has(s.id)).forEach(skill => {
      onUpdate({ ...skill, toolDescription: batchDesc });
    });
    setBatchDesc('');
    alert(`Applied description to ${selectedIds.size} skills.`);
  };

  const batchToggleRequired = (required: boolean) => {
    skills.filter(s => selectedIds.has(s.id)).forEach(skill => {
      const updatedParams = skill.parameters.map(p => ({ ...p, required }));
      onUpdate({ ...skill, parameters: updatedParams });
    });
  };

  const batchDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} skills?`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds(new Set());
      setActiveSkillId(skills.find(s => !selectedIds.has(s.id))?.id || null);
    }
  };

  const toggleParameterRequired = (paramName: string) => {
    if (activeSkill) {
      const updatedParameters = activeSkill.parameters.map(p => 
        p.name === paramName ? { ...p, required: !p.required } : p
      );
      onUpdate({ ...activeSkill, parameters: updatedParameters });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Skillset Blueprint</h2>
          <p className="text-slate-400">Review and refine tools for <span className="text-indigo-400 font-mono">@{metadata.packageName}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all font-medium"
          >
            Back
          </button>
          <button 
            onClick={onApprove}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-bold shadow-lg shadow-indigo-600/20"
          >
            Confirm & Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Skill List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Skill Inventory</h3>
            <button 
              onClick={handleSelectAll}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase"
            >
              {selectedIds.size === skills.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {skills.map(skill => (
              <div 
                key={skill.id}
                onClick={() => {
                  setActiveSkillId(skill.id);
                  if (selectedIds.size <= 1) {
                    setSelectedIds(new Set([skill.id]));
                  }
                }}
                className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${
                  activeSkillId === skill.id 
                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    onClick={(e) => toggleSelection(skill.id, e)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      selectedIds.has(skill.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-950 border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    {selectedIds.has(skill.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <span className={`font-mono text-sm block truncate ${activeSkillId === skill.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {skill.name}()
                    </span>
                    <p className="text-[10px] text-slate-500 truncate">{skill.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Editor / Batch Actions */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl min-h-[500px]">
          {isBatchMode ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Batch Actions</h3>
                  <p className="text-slate-500 text-sm">Applying changes to {selectedIds.size} selected skills</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-300 block">Bulk Update Tool Description</label>
                <textarea 
                  value={batchDesc}
                  onChange={(e) => setBatchDesc(e.target.value)}
                  placeholder="Enter new description for all selected tools..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 min-h-[100px] outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button 
                  onClick={applyBatchDescription}
                  disabled={!batchDesc}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Apply to {selectedIds.size} Skills
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white">Parameter Enforcement</h4>
                  <p className="text-xs text-slate-500">Set all parameters of selected skills to a specific status.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => batchToggleRequired(true)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-all"
                    >
                      Make All Required
                    </button>
                    <button 
                      onClick={() => batchToggleRequired(false)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-all"
                    >
                      Make All Optional
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-red-400">Destructive Actions</h4>
                  <p className="text-xs text-slate-500">Permanently remove these skills from your current package.</p>
                  <button 
                    onClick={batchDelete}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all border border-red-500/30"
                  >
                    Delete Selected Skills
                  </button>
                </div>
              </div>
            </div>
          ) : activeSkill ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 font-mono">{activeSkill.name}</h3>
                  <p className="text-slate-400">{activeSkill.description}</p>
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded text-xs text-indigo-400 font-mono border border-slate-800">
                  SKILL_DEF
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                   Tool Description (AI Guidance)
                </label>
                <textarea
                  value={activeSkill.toolDescription}
                  onChange={handleUpdateActiveDescription}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Parameters Schema</h4>
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-center">Req</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {activeSkill.parameters.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3 font-mono text-indigo-400">{p.name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-400">{p.type}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleParameterRequired(p.name)}
                              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                p.required ? 'bg-indigo-600' : 'bg-slate-700'
                              }`}
                            >
                              <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                p.required ? 'translate-x-5' : 'translate-x-1'
                              }`} />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Logic Implementation</h4>
                <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-xs text-indigo-300 font-mono leading-relaxed custom-scrollbar max-h-[250px]">
                  <code>{activeSkill.implementation}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 py-20">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-1.382-3.016z" />
              </svg>
              <p>Select multiple skills for batch editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillReview;
