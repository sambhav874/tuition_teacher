import { Message, VideoRef } from './types';
import { GoogleGenAI } from "@google/genai";
import { useStore } from './store';

// Initialize Gemini
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `
You are an expert AI Tutor for kids. Your goal is to help them with homework, explain concepts simply, and provide memory tricks.

**STRICT RULES:**
1.  **NO EMOJIS**: Do NOT use emojis in your response. Keep the tone professional, encouraging, and clean.
2.  **MONOCHROME**: Do not mention colors unless necessary for the subject (e.g., "The apple is red").

You must output a JSON object with the following structure:
{
  "content": "The main explanation or answer. Keep it encouraging and clear. Use markdown for formatting.",
  "metadata": {
    "tricks": ["A list of memory tricks or mnemonics"],
    "illustration": "A detailed description of a simple, black-and-white line drawing that would help explain this concept.",
    "videos": [
      {
        "id": "unique_id",
        "title": "A search query or title for a helpful video",
        "url": "https://www.youtube.com/results?search_query=SEARCH_TERM",
        "thumbnail": "https://img.youtube.com/vi/default/0.jpg"
      }
    ],
    "quiz": {
      "question": "A multiple choice question to test understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  }
}
For the "videos" array, since you cannot browse, generate a YouTube search URL based on the topic.
Example URL: https://www.youtube.com/results?search_query=photosynthesis+for+kids
`;

async function generateImage(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: prompt + " black and white line drawing, simple, educational, minimalist, high contrast, white background",
        });

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                const parts = candidate.content.parts;
                for (const part of parts) {
                    if (part.inlineData && part.inlineData.data) {
                        return part.inlineData.data;
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
}

export async function generateAIResponse(
    userMessage: string,
    attachments?: string[]
): Promise<Partial<Message>> {
    if (!apiKey) {
        return {
            role: 'agent',
            content: "⚠️ **Missing API Key**: Please add your `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`.",
        };
    }

    try {
        const { userName, userGrade } = useStore.getState();
        let personalizedPrompt = SYSTEM_PROMPT;
        if (userName) personalizedPrompt += `\nThe student's name is ${userName}. Use it occasionally to be friendly.`;
        if (userGrade) personalizedPrompt += `\nThe student is in Grade ${userGrade}. Adjust your explanation complexity accordingly.`;

        const parts: any[] = [{ text: personalizedPrompt + "\n\nUser Question: " + userMessage }];

        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                // Remove data:image/xxx;base64, prefix
                const base64Data = attachment.split(',')[1];
                // const mimeType = attachment.split(';')[0].split(':')[1]; // Not needed for new SDK apparently, or handled differently.
                // The new SDK handles inline data differently or similar. 
                // Let's check documentation or assume standard Part format for now.
                // Actually, for @google/genai, it might be simpler.
                // Let's stick to the Part format which is usually compatible.

                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: attachment.split(';')[0].split(':')[1]
                    }
                });
            }
        }

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: parts,
            config: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.text;

        try {
            const parsed = JSON.parse(responseText || "{}");

            // Generate Image if illustration is present
            if (parsed.metadata?.illustration) {
                const imageBase64 = await generateImage(parsed.metadata.illustration);
                if (imageBase64) {
                    // Replace description with base64 image
                    parsed.metadata.illustration = `data:image/png;base64,${imageBase64}`;
                }
            }

            return {
                role: 'agent',
                content: parsed.content,
                metadata: parsed.metadata,
            };
        } catch (e) {
            console.error("Failed to parse JSON response", e);
            return {
                role: 'agent',
                content: responseText || "Error generating response.",
            };
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            role: 'agent',
            content: "Sorry, I had trouble connecting to my brain! 🧠\n\nError: " + (error as any).message,
        };
    }
}
