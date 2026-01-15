
import { GoogleGenAI, Type } from "@google/genai";
import type { CommandSection } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const prompt = `
You are an expert document formatter specializing in command-line tool documentation.
Your task is to analyze the provided text, which contains a list of commands and their descriptions, and convert it into a structured JSON format.

The text is messy and uses '——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————' as a separator.
Identify the main sections (e.g., 'ADB Commands', 'ADB Shell Commands', 'Fastboot Commands').
For each section, extract all associated commands.
For each command, extract the full command string and its corresponding description.
Some command descriptions are multi-line or have special notes like '<Hit Enter and then execute the following command>'; preserve these details accurately in the description.

The final output must be a valid JSON array of objects, strictly adhering to the provided schema. Each object in the array represents a command section.
`;

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "The title of the command section (e.g., 'ADB Commands').",
      },
      commands: {
        type: Type.ARRAY,
        description: "A list of commands within this section.",
        items: {
          type: Type.OBJECT,
          properties: {
            command: {
              type: Type.STRING,
              description: "The full command string.",
            },
            description: {
              type: Type.STRING,
              description: "The detailed description of what the command does.",
            },
          },
          required: ["command", "description"],
        },
      },
    },
    required: ["title", "commands"],
  },
};

export const formatDocument = async (documentText: string): Promise<CommandSection[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompt}\n\n---\n\nDOCUMENT TO FIX:\n\n${documentText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }

    const parsedData = JSON.parse(jsonText);
    return parsedData as CommandSection[];

  } catch (error) {
    console.error("Error formatting document with Gemini API:", error);
    throw new Error("Failed to process the document with the AI service.");
  }
};
