import { Message, VideoRef } from './types';
import { GoogleGenAI } from "@google/genai";
import { useStore } from './store';

// Initialize Gemini
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `
You are an expert AI Tutor for kids. Your goal is to help them with homework, explain concepts simply, and provide memory tricks.

**STRICT RULES:**
1.  **CONCISE & DIRECT**: Responses must be straight to the point. Do NOT waffle. Do NOT miss anything important, but be highly concise.
2.  **STEP-BY-STEP**: For subjects that require it (Math, Science, Logic), you MUST provide a step-by-step solution.
3.  **PERSONALIZATION**: You MUST use the student's name and age/grade (provided in context) to tailor the explanation and tone.
4.  **SCOPE**: You must strictly stay within the scope of study/education.
5.  **GREETINGS**: If the user says "hello", "hi", etc., answer generally and briefly. Do NOT go beyond study topics unless asked.
6.  **NO EMOJIS**: Do NOT use emojis in your response. Keep the tone professional, encouraging, and clean.
7.  **MONOCHROME**: Do not mention colors unless necessary for the subject (e.g., "The apple is red").

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
    },
    "mockTest": [
      {
        "question": "Question 1",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }
    ],
    "flashcards": [
      {
        "front": "Term or Concept",
        "back": "Definition or Explanation"
      }
    ],
    "references": [
      {
        "title": "Title of the source",
        "url": "URL of the source"
      }
    ]
  }
}
For the "videos" array, since you cannot browse, generate a YouTube search URL based on the topic.
Example URL: https://www.youtube.com/results?search_query=photosynthesis+for+kids

**SPECIAL FEATURES:**
1.  **MOCK TESTS**: If the user asks for a "Mock Test", "Quiz", or "Test" on a specific topic/chapter/board, generate a mockTest array with at least 5 questions.
2.  **NOTES/FLASHCARDS**: If the user asks for "Notes" or "Flashcards", generate a structured summary in content and a flashcards array in metadata.
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
    attachments?: string[],
    options?: { mode?: 'standard' | 'english-tutor' | 'mock-test' | 'notes' }
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

        // Strictly enforce context usage
        if (userName) {
            personalizedPrompt += `\n\nCONTEXT - STUDENT NAME: ${userName}. Address them by name when appropriate.`;
        }
        if (userGrade) {
            personalizedPrompt += `\nCONTEXT - STUDENT GRADE/AGE: Grade ${userGrade}. Adjust complexity to suit this age group perfectly.`;
        } else {
            personalizedPrompt += `\nCONTEXT - STUDENT GRADE/AGE: Unknown. Assume a general student level but keep it simple.`;
        }

        if (options?.mode === 'english-tutor') {
            personalizedPrompt += `
\n**ENGLISH LEARNING MODE ENABLED**
The student is a Hindi speaker trying to improve their English.
1.  **Audio Analysis**: If the user sends an audio file, LISTEN to it. Transcribe what you heard. Critique the pronunciation, intonation, and fluency.
2.  **Simple English**: Use clear, simple vocabulary.
3.  **Hinglish Support**: If the user asks in Hindi/Hinglish, understand it but reply in English (with optional Hindi translation for difficult terms).
4.  **Vocabulary & Pronunciation**: Highlight key English words. You can provide phonetics if helpful.
5.  **Grammar Coach**: Gently correct any major grammar mistakes in the user's input, explaining the rule briefly.
`;
        } else if (options?.mode === 'mock-test') {
            personalizedPrompt += `
\n**MOCK TEST MODE ENABLED**
You are an expert Exam Setter.
1.  **Goal**: Create a high-quality, challenging mock test based on the user's request (Subject, Grade, Board, Topic).
2.  **Structure**: ALWAYS generate a JSON \`mockTest\` array in the metadata.
3.  **Reference Image**: If the user uploads an image, treat it as a reference question or syllabus. Create similar or related questions.
4.  **Conciseness**: Keep the chat text brief ("Here is your mock test..."). Focus on the JSON output.
5.  **NO DISTRACTIONS**: Do NOT generate "quiz", "illustration", "videos", or "tricks" metadata. Only \`mockTest\`.
6.  **COMPREHENSIVE**: Cover the topic thoroughly. Do not hesitate to generate a long test if needed.
`;
        } else if (options?.mode === 'notes') {
            personalizedPrompt += `
\n**NOTES GENERATOR MODE ENABLED**
You are an expert Study Assistant.
1.  **Goal**: Convert the user's input (text or image) into concise, high-quality study notes.
2.  **Format**: Use Markdown for the notes in the \`content\` field. Use headers, bullet points, and bold text for key terms.
3.  **Flashcards**: ALWAYS generate a JSON \`flashcards\` array in the metadata for key concepts found in the input.
4.  **Precision**: Be very precise. Do not add unnecessary fluff.
5.  **NO DISTRACTIONS**: Do NOT generate "quiz", "illustration", "videos", or "tricks" metadata. Only \`flashcards\`.
6.  **COMPREHENSIVE**: Cover ALL key points from the input. Do not miss anything.
`;
        }

        const parts: any[] = [{ text: personalizedPrompt + "\n\nUser Question: " + userMessage }];

        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                // Remove data:image/xxx;base64, prefix
                const base64Data = attachment.split(',')[1];
                const mimeType = attachment.split(';')[0].split(':')[1];

                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            }
        }

        const result = await ai.models.generateContent({
            model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash-exp",
            contents: parts,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let responseText = result.text;
        let parsed: any = {};

        try {
            if (!responseText) throw new Error("Empty response");

            // Attempt 1: Direct parse
            try {
                parsed = JSON.parse(responseText);
            } catch (e) {
                // Attempt 2: Extract from markdown code blocks
                const codeBlockMatch = responseText.match(/```json([\s\S]*?)```/) || responseText.match(/```([\s\S]*?)```/);
                if (codeBlockMatch) {
                    try {
                        parsed = JSON.parse(codeBlockMatch[1]);
                    } catch (e2) {
                        // continue
                    }
                }

                // Attempt 3: Find first { and last } (Robust fallback)
                if (Object.keys(parsed).length === 0) {
                    const firstOpen = responseText.indexOf('{');
                    const lastClose = responseText.lastIndexOf('}');
                    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                        try {
                            const jsonSubstring = responseText.substring(firstOpen, lastClose + 1);
                            parsed = JSON.parse(jsonSubstring);
                        } catch (e3) {
                            console.error("Failed to extract JSON substring", e3);
                        }
                    }
                }
            }

            // If still no valid JSON, treat text as content
            if (Object.keys(parsed).length === 0) {
                parsed = {
                    content: responseText,
                    metadata: {}
                };
            }

            // Generate Image if illustration is present
            if (parsed.metadata?.illustration) {
                const imageBase64 = await generateImage(parsed.metadata.illustration);
                if (imageBase64) {
                    // Replace description with base64 image
                    parsed.metadata.illustration = `data:image/png;base64,${imageBase64}`;
                }
            }

            // Extract grounding metadata if available (though we asked for it in JSON, 
            // the model might sometimes put it in the groundingMetadata field of the response object, 
            // but here we are parsing the text generation which we instructed to include references).
            // If the model follows instructions, references will be in parsed.metadata.references.

            return {
                role: 'agent',
                content: parsed.content,
                metadata: parsed.metadata,
            };
        } catch (e) {
            console.error("Failed to parse JSON response", e);
            console.log("Raw Response:", responseText); // Log raw response for debugging
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
