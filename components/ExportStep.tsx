
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Skill, ProjectMetadata } from '../types';

interface Props {
  metadata: ProjectMetadata;
  skills: Skill[];
  onBack: () => void;
}

const ExportStep: React.FC<Props> = ({ metadata, skills, onBack }) => {
  const [activeTab, setActiveTab] = useState<'index' | 'package' | 'readme' | 'integration'>('index');
  const [version, setVersion] = useState(metadata.version);
  const [isBuilding, setIsBuilding] = useState(true);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const logs = [
      "Initializing workspace...",
      `Configuring package: @forge/${metadata.packageName}`,
      "Analyzing skill implementations...",
      "Generating TypeScript tool definitions...",
      "Resolving dependencies...",
      "Writing package.json...",
      "Compiling README.md documentation...",
      "Finalizing assets for distribution..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setBuildProgress((prev) => {
        const next = prev + (100 / (logs.length + 2));
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsBuilding(false), 500);
          return 100;
        }
        return next;
      });

      if (currentLogIndex < logs.length) {
        setBuildLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 400);

    return () => clearInterval(interval);
  }, [metadata.packageName]);

  const generateIndex = () => {
    const skillFunctions = skills.map(skill => `
/**
 * ${skill.toolDescription || skill.description}
 * @param {object} args - Arguments matching schema
 */
export async function ${skill.name}(args) {
  const { ${skill.parameters.map(p => p.name).join(', ')} } = args;
  
  // Implementation
  ${skill.implementation.split('\n').join('\n  ')}
}`).join('\n');

    const manifest = `
/**
 * Manifest of all available tools in this package.
 * Optimized for AI Agent discovery and registration.
 */
export const toolManifest = [
  ${skills.map(skill => `{
    name: "${skill.name}",
    description: "${skill.toolDescription || skill.description}",
    parameters: {
      type: "object",
      properties: {
        ${skill.parameters.map(p => `"${p.name}": { type: "${p.type}", description: "${p.description}" }`).join(',\n        ')}
      },
      required: [${skill.parameters.filter(p => p.required).map(p => `"${p.name}"`).join(', ')}]
    }
  }`).join(',\n  ')}
];`;

    const dispatcher = `
/**
 * The primary dynamic execution engine for ${metadata.packageName}.
 * This function allows any AI Agent or IDE (Cursor, Claude Code, etc.)
 * to call specific skills by name with validated JSON arguments.
 * 
 * @param {string} skillName - The identifier of the skill to run
 * @param {Record<string, any>} args - Parameters required by the skill
 * @returns {Promise<any>} The result of the skill execution
 */
export async function executeSkill(skillName, args = {}) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(\`\\n[\${timestamp}] [SkillForge] 🚀 Dispatching Skill: \${skillName}\`);

  const registry = {
    ${skills.map(s => `${s.name}`).join(',\n    ')}
  };

  const skill = registry[skillName];
  if (!skill) {
    const errMsg = \`Skill "\${skillName}" not found. Available: \${Object.keys(registry).join(', ')}\`;
    console.error(\`[\${timestamp}] [SkillForge] ❌ Error: \${errMsg}\`);
    throw new Error(errMsg);
  }

  // Runtime Schema Validation
  const manifest = toolManifest.find(m => m.name === skillName);
  if (manifest) {
    const { properties, required } = manifest.parameters;
    
    // Validate required parameters
    for (const req of (required || [])) {
      if (!(req in args)) {
        throw new Error(\`Validation Error: Missing required parameter "\${req}"\`);
      }
    }

    // Validate parameter types
    for (const [key, val] of Object.entries(args)) {
      const schema = properties[key];
      if (schema) {
        const expected = schema.type;
        const actual = Array.isArray(val) ? 'array' : (val === null ? 'null' : typeof val);
        
        let isValid = true;
        if (expected === 'array' && actual !== 'array') isValid = false;
        else if (expected === 'object' && (actual !== 'object' || Array.isArray(val) || val === null)) isValid = false;
        else if (expected !== 'array' && expected !== 'object' && actual !== expected) isValid = false;

        if (!isValid) {
          throw new Error(\`Validation Error: Parameter "\${key}" must be \${expected}, but received \${actual}\`);
        }
      }
    }
  }

  try {
    const result = await skill(args);
    const duration = Date.now() - startTime;
    console.log(\`[\${timestamp}] [SkillForge] ✅ Success: \${skillName} in \${duration}ms\`);
    return result;
  } catch (err) {
    console.error(\`[\${timestamp}] [SkillForge] 💥 Runtime Error: \`, err.message);
    throw err;
  }
}`;

    const cliEntry = `
/**
 * Interactive CLI Wrapper
 * If run without arguments, provides an interactive shell for testing.
 */
async function runCli() {
  if (typeof process === 'undefined' || !process.argv) return;
  
  const args = process.argv.slice(2);
  
  // Basic Help Output
  if (args.includes('--help') || args.includes('-h')) {
    console.log(\`\\n🚀 ${metadata.packageName} v\${version}\`);
    console.log('USAGE:');
    console.log('  skillforge <skillName> --args=\\'{"key": "val"}\\'');
    console.log('\\nSKILLS:');
    ${skills.map(s => `console.log('  - ${s.name}: ${s.description}');`).join('\n  ')}
    return;
  }

  // Interactive Mode
  if (args.length === 0) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(\`\\n🛠️  SkillForge Interactive Mode - ${metadata.packageName} v\${version}\`);
    console.log('Available skills:', toolManifest.map(m => m.name).join(', '));
    
    const ask = (q) => new Promise(res => readline.question(q, res));
    
    try {
      const skillName = await ask('\\nEnter skill name: ');
      if (!skillName) {
        readline.close();
        return;
      }
      
      const jsonArgs = await ask('Enter JSON arguments (default {}): ') || '{}';
      readline.close();
      
      const parsedArgs = JSON.parse(jsonArgs);
      const result = await executeSkill(skillName, parsedArgs);
      console.log('\\n[RESULT]:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('\\n❌ Interactive Error:', e.message);
      readline.close();
    }
    return;
  }

  // Direct Command Line Execution
  const skillName = args[0];
  let rawJsonArgs = '{}';

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--args=')) {
      rawJsonArgs = args[i].substring(7);
    } else if (args[i] === '--args' && args[i + 1]) {
      rawJsonArgs = args[i + 1];
    }
  }

  try {
    const result = await executeSkill(skillName, JSON.parse(rawJsonArgs));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    process.exit(1);
  }
}

// Auto-run when called via CLI
if (typeof require !== 'undefined' && require.main === module) {
  runCli();
}
`;

    return `#!/usr/bin/env node
/**
 * ${metadata.packageName} - Pro AI Agent Skillset
 * Generated by SkillForge AI
 * This file is self-contained and ready for distribution via NPX.
 */

${skillFunctions}

${manifest}

${dispatcher}

${cliEntry}
`;
  };

  const generatePackageJson = () => {
    return JSON.stringify({
      name: `@forge/${metadata.packageName}`,
      version: version,
      description: metadata.description,
      main: "dist/index.js",
      bin: {
        [metadata.packageName]: "dist/index.js",
        "skillforge": "dist/index.js"
      },
      scripts: {
        "build": "tsc",
        "start": "node dist/index.js"
      },
      author: metadata.author,
      license: "MIT",
      dependencies: {
        "dotenv": "^16.0.0"
      },
      devDependencies: {
        "typescript": "^5.0.0"
      }
    }, null, 2);
  };

  const generateReadme = () => {
    const skillDetails = skills.map(skill => {
      const sampleArgs = skill.parameters.reduce((acc: any, p) => {
        acc[p.name] = p.type === 'string' ? 'value' : (p.type === 'number' ? 0 : (p.type === 'boolean' ? true : (p.type === 'array' ? [] : {})));
        return acc;
      }, {});

      return `### \`${skill.name}()\`

${skill.toolDescription || skill.description}

#### Parameters
| Name | Type | Req | Description |
| :--- | :--- | :--- | :--- |
${skill.parameters.map(p => `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Yes' : 'No'} | ${p.description} |`).join('\n')}

#### CLI Usage
\`\`\`bash
skillforge ${skill.name} --args '${JSON.stringify(sampleArgs)}'
\`\`\`
`;
    }).join('\n---\n\n');

    return `# ${metadata.packageName}

Skillset Blueprint for: ${metadata.idea}

## Quick Start
\`\`\`bash
npm install -g @forge/${metadata.packageName}
# Or run interactively
npx @forge/${metadata.packageName}
\`\`\`

## Skill Reference
${skillDetails}
`;
  };

  const generateIntegrationPanel = () => {
    return `// Dynamic Discovery
import { toolManifest, executeSkill } from '@forge/${metadata.packageName}';

/**
 * Example: Universal Integration Wrapper
 * This pattern allows any LLM to call your skills dynamically.
 */
async function agentBridge(call) {
  const { functionName, arguments: args } = call;
  return await executeSkill(functionName, args);
}
`;
  };

  const codeContents: Record<string, string> = {
    index: generateIndex(),
    package: generatePackageJson(),
    readme: generateReadme(),
    integration: generateIntegrationPanel()
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContents[activeTab]);
    alert("Copied to clipboard!");
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9.]*$/.test(val)) {
      setVersion(val);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      zip.file("index.ts", codeContents.index);
      zip.file("package.json", codeContents.package);
      zip.file("README.md", codeContents.readme);
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metadata.packageName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
      alert("Failed to generate download.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isBuilding) {
    return (
      <div className="max-w-3xl mx-auto py-20 animate-in fade-in duration-500">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">SkillForge Build Session</span>
            <div className="w-12"></div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-indigo-400">Packaging Agent Core...</span>
                <span className="text-slate-500">{Math.round(buildProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                  style={{ width: `${buildProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-black/50 p-6 rounded-xl font-mono text-xs text-slate-400 space-y-1 h-48 overflow-y-auto no-scrollbar border border-slate-800/50">
              {buildLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={idx === buildLogs.length - 1 ? 'text-indigo-300 font-bold' : ''}>
                    {idx === buildLogs.length - 1 ? '> ' : '  '}{log}
                  </span>
                </div>
              ))}
              <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block align-middle ml-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Build Success</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Your Package is Ready</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all font-medium"
          >
            Edit Skills
          </button>
          <button 
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-bold flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-indigo-600/20"
          >
            {isDownloading ? 'Downloading...' : 'Download ZIP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
             <h3 className="font-bold text-white flex items-center gap-2">Package Settings</h3>
             <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={handleVersionChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-indigo-400 font-mono"
                  placeholder="1.0.0"
                />
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
             <h3 className="font-bold text-white">Universal Integration</h3>
             <p className="text-xs text-slate-400 leading-relaxed">
               This package is optimized for <b>Antigravity</b>, <b>Cursor</b>, <b>VS Code</b>, and <b>Claude Code</b>.
             </p>
             <button 
                onClick={() => setActiveTab('integration')}
                className="w-full py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold hover:bg-slate-700 transition-all"
             >
               View Integration Snippets
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'index', label: 'index.ts', icon: '📄' },
              { id: 'package', label: 'package.json', icon: '📦' },
              { id: 'integration', label: 'Agent Connect', icon: '⚡' },
              { id: 'readme', label: 'README.md', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 border-indigo-500 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <div className="flex-1"></div>
            <button 
              onClick={handleCopy}
              className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600/30 transition-all border border-indigo-500/30"
            >
              Copy
            </button>
          </div>

          <div className="relative group">
            <pre className="bg-slate-900 border border-slate-800 rounded-2xl p-8 overflow-auto max-h-[600px] text-sm font-mono leading-relaxed text-slate-300 custom-scrollbar">
              <code>{codeContents[activeTab]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportStep;
