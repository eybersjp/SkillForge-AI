
import JSZip from 'jszip';
import { Skill, ProjectMetadata } from '../types';

export const parseSkillPackage = async (file: File): Promise<{ metadata: ProjectMetadata; skills: Skill[] }> => {
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  
  // 1. Parse Metadata from package.json
  const packageJsonFile = content.file('package.json');
  if (!packageJsonFile) throw new Error("Invalid skill package: missing package.json");
  
  const packageData = JSON.parse(await packageJsonFile.async('string'));
  
  // 2. Parse Skills from index.ts
  const indexTsFile = content.file('index.ts');
  if (!indexTsFile) throw new Error("Invalid skill package: missing index.ts");
  
  const indexContent = await indexTsFile.async('string');
  
  // Extract toolManifest array string using regex
  const manifestMatch = indexContent.match(/export const toolManifest = (\[[\s\S]*?\]);/);
  if (!manifestMatch) throw new Error("Could not find toolManifest in package");
  
  // Clean up the manifest string to make it valid JSON (remove property names that aren't quoted if any)
  // Our generator uses double quotes for property names, so JSON.parse might work if we clean trailing commas
  let manifestStr = manifestMatch[1].replace(/,\s*([\]}])/g, '$1');
  
  // Because toolManifest in index.ts is written as a JS object (keys might not be quoted)
  // we use a safer extraction or eval-like approach if it were strictly internal, 
  // but let's try a robust regex parse for the fields we need.
  const skillEntries = indexContent.split('export async function ').slice(1);
  const skills: Skill[] = [];

  // Helper to extract manifest info for a specific skill
  const getManifestInfo = (skillName: string) => {
    const pattern = new RegExp(`name:\\s*"${skillName}"[\\s\\S]*?description:\\s*"([^"]*)"[\\s\\S]*?properties:\\s*\\{([\\s\\S]*?)\\}`);
    const match = indexContent.match(pattern);
    if (!match) return { description: '', parameters: [] };
    
    const desc = match[1];
    const propsStr = match[2];
    const params: any[] = [];
    
    // Extract parameters
    const paramPattern = /"([^"]+)":\s*\{\s*type:\s*"([^"]+)",\s*description:\s*"([^"]+)"\s*\}/g;
    let pMatch;
    while ((pMatch = paramPattern.exec(propsStr)) !== null) {
      params.push({
        name: pMatch[1],
        type: pMatch[2],
        description: pMatch[3],
        required: true // Default for restoration
      });
    }
    
    return { description: desc, parameters: params };
  };

  for (const entry of skillEntries) {
    const nameMatch = entry.match(/^(\w+)\(/);
    if (!nameMatch) continue;
    
    const name = nameMatch[1];
    const body = entry.substring(entry.indexOf('{') + 1, entry.lastIndexOf('}')).trim();
    
    // Get info from manifest
    const info = getManifestInfo(name);
    
    skills.push({
      id: Math.random().toString(36).substring(7),
      name,
      description: info.description,
      toolDescription: info.description,
      parameters: info.parameters,
      implementation: body
    });
  }

  const metadata: ProjectMetadata = {
    idea: `Restored project from ${file.name}`,
    packageName: packageData.name.replace('@forge/', ''),
    version: packageData.version,
    author: packageData.author || 'Restored User',
    description: packageData.description
  };

  return { metadata, skills };
};
