
import React, { useState } from 'react';
import { ProjectMetadata, Skill } from '../types';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: 'Finance' | 'DevOps' | 'Creative' | 'Productivity';
  skillsCount: number;
  metadata: ProjectMetadata;
  skills: Skill[];
}

interface Props {
  onFork: (metadata: ProjectMetadata, skills: Skill[]) => void;
  onBack: () => void;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'fin-001',
    title: 'DeFi Portfolio Manager',
    category: 'Finance',
    description: 'Advanced toolset for tracking wallet balances across chains and suggesting yield optimizations.',
    skillsCount: 4,
    metadata: {
      idea: 'DeFi Portfolio Manager for multi-chain assets',
      packageName: 'defi-portfolio-manager',
      version: '1.0.0',
      author: 'FinTech Labs',
      description: 'AI Agent skills for decentralized finance management'
    },
    skills: [
      {
        id: 's1',
        name: 'fetchWalletBalances',
        description: 'Retrieves current token balances for a given address.',
        toolDescription: 'Use this to check a user\'s crypto holdings across multiple networks.',
        parameters: [
          { name: 'address', type: 'string', description: 'Public wallet address', required: true },
          { name: 'chains', type: 'array', description: 'List of chains to check', required: false }
        ],
        implementation: '// Implementation logic for balance fetching\nreturn { ethereum: "2.5 ETH", polygon: "500 MATIC" };'
      },
      {
        id: 's2',
        name: 'scanYieldOpportunities',
        description: 'Analyzes protocols for best APY based on provided assets.',
        toolDescription: 'Use this to find where a user can earn the most yield on their tokens.',
        parameters: [
          { name: 'tokens', type: 'array', description: 'Tokens to analyze', required: true }
        ],
        implementation: '// Yield scanning logic\nreturn [{ protocol: "Aave", apy: "4.2%" }, { protocol: "Compound", apy: "3.8%" }];'
      }
    ]
  },
  {
    id: 'dev-001',
    title: 'Cloud Architect Assistant',
    category: 'DevOps',
    description: 'Infrastructure automation toolkit for managing AWS/GCP clusters and CI/CD pipelines.',
    skillsCount: 5,
    metadata: {
      idea: 'Cloud Architecture and infrastructure management suite',
      packageName: 'cloud-architect-assistant',
      version: '1.2.0',
      author: 'OpsGenie',
      description: 'DevOps automation skills for AI agents'
    },
    skills: [
      {
        id: 's3',
        name: 'provisionCluster',
        description: 'Creates a new Kubernetes cluster on the cloud provider.',
        toolDescription: 'Use this when the user needs to spin up new infrastructure.',
        parameters: [
          { name: 'provider', type: 'string', description: 'AWS or GCP', required: true },
          { name: 'nodeCount', type: 'number', description: 'Desired number of nodes', required: true }
        ],
        implementation: '// Terraform execution logic\nreturn { clusterId: "k8s-prod-001", status: "provisioning" };'
      }
    ]
  },
  {
    id: 'cre-001',
    title: 'Marketing Content Engine',
    category: 'Creative',
    description: 'Streamline social media scheduling, SEO analysis, and automated copywriting workflows.',
    skillsCount: 6,
    metadata: {
      idea: 'Multi-platform marketing and content generation engine',
      packageName: 'marketing-content-engine',
      version: '1.0.1',
      author: 'CreativeFlow',
      description: 'Creative production skills for AI agents'
    },
    skills: [
      {
        id: 's4',
        name: 'analyzeSEO',
        description: 'Audits a URL for search engine optimization performance.',
        toolDescription: 'Use this to evaluate the SEO health of a landing page or blog post.',
        parameters: [
          { name: 'url', type: 'string', description: 'Target URL', required: true }
        ],
        implementation: '// SEO auditing logic\nreturn { score: 85, issues: ["Missing alt tags", "Slow LCP"] };'
      }
    ]
  },
  {
    id: 'pro-001',
    title: 'Exec Admin Toolkit',
    category: 'Productivity',
    description: 'Manage calendars, organize meeting notes, and automate professional follow-ups.',
    skillsCount: 3,
    metadata: {
      idea: 'Executive assistant toolset for productivity and scheduling',
      packageName: 'exec-admin-toolkit',
      version: '0.9.5',
      author: 'TaskMaster',
      description: 'Administrative productivity skills for AI agents'
    },
    skills: [
      {
        id: 's5',
        name: 'syncCalendars',
        description: 'Coordinates schedules between personal and professional calendars.',
        toolDescription: 'Use this to find free slots across multiple calendars.',
        parameters: [
          { name: 'user_id', type: 'string', description: 'User identifier', required: true }
        ],
        implementation: '// Oauth sync logic\nreturn { events: [], overlaps_found: 2 };'
      }
    ]
  }
];

const Gallery: React.FC<Props> = ({ onFork, onBack }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Finance', 'DevOps', 'Creative', 'Productivity'];
  
  const filteredItems = GALLERY_ITEMS.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white">Community <span className="text-indigo-400">Gallery</span></h1>
          <p className="text-slate-400 max-w-xl text-lg">Browse pre-forged agent toolkits designed by the community. Fork any project to start customizing it.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all font-medium self-start md:self-center"
        >
          Back to Workspace
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blueprints..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] p-8 hover:border-indigo-500/50 transition-all duration-500 flex flex-col justify-between overflow-hidden"
          >
            {/* Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] group-hover:bg-indigo-600/20 transition-all"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {item.skillsCount} Skills
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.skills.slice(0, 3).map(skill => (
                  <span key={skill.id} className="text-[10px] font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800">
                    {skill.name}()
                  </span>
                ))}
                {item.skills.length > 3 && <span className="text-[10px] text-slate-600">+{item.skills.length - 3} more</span>}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {item.metadata.author.charAt(0)}
                </div>
                <span className="text-xs text-slate-500">{item.metadata.author}</span>
              </div>
              <button 
                onClick={() => onFork(item.metadata, item.skills)}
                className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Fork Blueprint
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-4 bg-slate-900/20 border border-dashed border-slate-800 rounded-[2rem]">
            <p className="text-slate-500 italic">No blueprints found matching your criteria.</p>
            <button 
              onClick={() => {setSearch(''); setFilter('All');}}
              className="text-indigo-400 text-sm font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Have a world-class skillset?</h2>
        <p className="text-slate-400 max-w-md mx-auto text-sm">Contribute your forged toolsets to the gallery and help other developers build faster.</p>
        <button className="px-8 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all">
          Submit to Gallery
        </button>
      </section>
    </div>
  );
};

export default Gallery;
