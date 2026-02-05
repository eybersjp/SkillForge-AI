
import { GoogleGenAI, Type } from "@google/genai";
import { Skill, ProjectMetadata } from "../types";

/**
 * Custom error class for SkillForge specific failures
 */
export class GenerationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Utility for exponential backoff retries
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> => {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const msg = error.message || "";
      const isRetryable = msg.includes('429') || msg.includes('500') || msg.includes('503') || msg.includes('overloaded');
      if (!isRetryable || i === maxRetries) break;
      
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.warn(`Retry attempt ${i + 1} after ${Math.round(delay)}ms due to: ${msg}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const generateSkills = async (metadata: ProjectMetadata): Promise<Skill[]> => {
  if (!process.env.API_KEY) {
    throw new GenerationError("API Key is missing. Please ensure your environment is configured correctly.", "MISSING_KEY");
  }

  try {
    const response = await withRetry(async () => {
      const model = ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as a senior software architect specializing in AI Agent Tooling. 
        The user has an idea: "${metadata.idea}".
        Generate a set of 4-6 distinct, highly functional "Skills" (tools/functions) that an AI Agent would need to execute this idea.
        
        For each skill:
        1. Provide a clear, descriptive name (camelCase).
        2. A concise internal description for the blueprint.
        3. A professional 'toolDescription' intended for the AI Agent's system prompt to understand when and how to use the tool.
        4. A list of necessary input parameters with types and descriptions.
        5. A TypeScript/JavaScript implementation of the function logic. Use placeholder logic but make it structurally sound.
        
        Ensure the package name "${metadata.packageName}" is considered in context.`,
        config: {
          thinkingConfig: { thinkingBudget: 12000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                toolDescription: { type: Type.STRING },
                parameters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      required: { type: Type.BOOLEAN }
                    },
                    required: ["name", "type", "description", "required"]
                  }
                },
                implementation: { type: Type.STRING }
              },
              required: ["id", "name", "description", "toolDescription", "parameters", "implementation"]
            }
          }
        }
      });
      return await model;
    });

    const text = response.text;
    if (!text) {
      throw new GenerationError("The AI returned an empty response. This can happen if the content was flagged or the model timed out.", "EMPTY_RESPONSE");
    }

    try {
      const skills: Skill[] = JSON.parse(text);
      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("Invalid structure");
      }
      return skills;
    } catch (parseError) {
      console.error("Failed to parse Gemini response JSON:", text);
      throw new GenerationError("The generated code was malformed. Please try again with a slightly different idea description.", "PARSE_ERROR");
    }

  } catch (error: any) {
    console.error("Skill Generation Error:", error);
    
    if (error instanceof GenerationError) {
      throw error;
    }

    const msg = error.message || "";

    // 429 - Too Many Requests
    if (msg.includes('429')) {
      throw new GenerationError("Gemini is currently overloaded or you've hit a rate limit. Please wait 30 seconds and try again.", "RATE_LIMIT");
    }
    
    // 403 - Forbidden / Permission Denied
    if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
      throw new GenerationError("Access denied. Your API key might not have permission for the 'gemini-3-pro-preview' model or billing isn't active.", "PERMISSION_DENIED");
    }

    // 404 - Not Found
    if (msg.includes('Requested entity was not found') || msg.includes('404')) {
      throw new GenerationError("The specified AI model could not be found. We might be experiencing a temporary configuration issue.", "MODEL_NOT_FOUND");
    }

    // Quota Exhausted
    if (msg.includes('quota') || msg.includes('exhausted')) {
      throw new GenerationError("Your API quota has been exhausted. Check your Google AI Studio dashboard for remaining credits.", "QUOTA_EXHAUSTED");
    }

    // Safety Filter Blocks
    if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('candidate')) {
      throw new GenerationError("The request was blocked by safety filters. Try rephrasing your idea to avoid sensitive or restricted topics.", "SAFETY_BLOCKED");
    }

    // Default Fallback
    throw new GenerationError(
      msg || "An unexpected error occurred while forging your skills. Please check your internet connection and try again.",
      "UNKNOWN_ERROR"
    );
  }
};
