
export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  toolDescription: string;
  parameters: Parameter[];
  implementation: string;
}

export interface ProjectMetadata {
  idea: string;
  packageName: string;
  version: string;
  author: string;
  description: string;
}

export type AppStep = 'input' | 'generating' | 'review' | 'export' | 'documentation' | 'gallery';
