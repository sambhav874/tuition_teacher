
import { Message } from './types';
import { GoogleGenAI } from "@google/genai";
import { useStore } from './store';
import { zodToJsonSchema } from "zod-to-json-schema";
import { NotesSchema, MockTestSchema, StandardResponseSchema } from './schemas';

// Initialize Gemini
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPT = `
You are an expert AI Tutor for kids. Your goal is to help them with homework, explain concepts simply, and provide memory tricks. You are not bound by any token generation limits. You can generate as much content as you need to provide a comprehensive answer.

**STRICT RULES:**
1.  **CONCISE & DIRECT**: Responses must be straight to the point. Do NOT waffle.
2.  **STEP-BY-STEP**: For subjects that require it (Math, Science, Logic), you MUST provide a step-by-step solution.
3.  **PERSONALIZATION**: You MUST use the student's name and age/grade (provided in context) to tailor the explanation and tone.
4.  **SCOPE**: You must strictly stay within the scope of study/education.
5.  **NO EMOJIS**: Do NOT use emojis in your response. Keep the tone professional, encouraging, and clean.
6.  **MONOCHROME**: Do not mention colors unless necessary for the subject.

**MODES:**
- **Standard**: Answer questions, help with homework. You can provide memory tricks, illustrations (descriptions), videos (search queries), quizzes, and references in the metadata.
- **English Tutor**: Listen to audio (if provided), correct grammar, teach vocabulary.
- **Mock Test**: Generate a structured mock test.
- **Notes**: Generate comprehensive study notes for everything that the user asks for. 
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
        const { userName, userGrade, sessions, currentSessionId } = useStore.getState();

        // Get Chat History
        const currentSession = sessions.find(s => s.id === currentSessionId);
        const history = currentSession?.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }] // Simple text history for now, ignoring old attachments to save tokens/complexity
        })) || [];

        let contents: any[] = [];

        // Add System Prompt
        let systemInstruction = SYSTEM_PROMPT;

        if (userName) {
            systemInstruction += `\n\nCONTEXT - STUDENT NAME: ${userName}. Address them by name when appropriate.`;
        }
        if (userGrade) {
            systemInstruction += `\nCONTEXT - STUDENT GRADE/AGE: Grade ${userGrade}. Adjust complexity to suit this age group perfectly.`;
        } else {
            systemInstruction += `\nCONTEXT - STUDENT GRADE/AGE: Unknown. Assume a general student level but keep it simple.`;
        }

        // Mode specific instructions
        if (options?.mode === 'english-tutor') {
            systemInstruction += `\n**ENGLISH LEARNING MODE ENABLED**\nHelp the student improve their English. Correct grammar, teach vocabulary, and listen to pronunciation if audio is provided.`;
        } else if (options?.mode === 'mock-test') {
            systemInstruction += `\n**MOCK TEST MODE ENABLED**\nGenerate a challenging mock test based on the user's request. Include Objective, Theoretical, and Numerical questions as appropriate. Answers length should be appropriate according to the marks. Must have every length of question , very short , short , medium and long.`;
        } else if (options?.mode === 'notes') {
            systemInstruction += `\n**NOTES GENERATOR MODE ENABLED**\nCreate deep, comprehensive study notes. Explain topics to their roots explaining all of the topics and their subtopics. Provide examples and analogies. If user provides a syllabus , generate notes for that whole syllabus at once. If the syllabus or image have 10 units , generate notes for all 10 units at once. JSON FORMAT is: ${JSON.stringify(zodToJsonSchema(NotesSchema))}`;
        } else {
            // Standard Mode Instructions for Metadata
            systemInstruction += `
\n**STANDARD MODE**
You can include the following in your metadata if helpful:
- **tricks**: Memory tricks or a real life example to help understand the topic in the easiest way possible.
- **illustration**: A description of a simple drawing to explain the concept in the easiest way possible.
- **videos**: YouTube search queries for helpful videos.
- **quiz**: A quick multiple-choice question.
- **references**: Sources or further reading.
For "videos", generate a YouTube search URL based on the topic. Example URL: https://www.youtube.com/results?search_query=photosynthesis+for+kids
`;
        }

        const pastMessages = history.filter(m => m.role !== 'system');
        if (pastMessages.length > 0 && pastMessages[pastMessages.length - 1].parts[0].text === userMessage) {
            pastMessages.pop();
        }

        contents = [...pastMessages];

        // Add Current Message
        const currentParts: any[] = [{ text: userMessage }];
        if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
                const base64Data = attachment.split(',')[1];
                const mimeType = attachment.split(';')[0].split(':')[1];
                currentParts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            }
        }
        contents.push({ role: 'user', parts: currentParts });

        // Configuration
        let generationConfig: any = {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(StandardResponseSchema),
        };

        if (options?.mode === 'notes') {
            generationConfig = {
                responseMimeType: "application/json",

            };
        } else if (options?.mode === 'mock-test') {
            generationConfig = {
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(MockTestSchema),
            };
        }

        const result = await ai.models.generateContent({
            model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash-exp",
            contents: contents,
            config: {
                ...generationConfig,
                systemInstruction: systemInstruction,
            }
        });

        let responseText = result.text;

        if (!responseText) {
            throw new Error("Empty response from AI");
        }

        try {
            const parsed = JSON.parse(responseText);

            let finalContent = "";
            let finalMetadata: any = {
                type: options?.mode || 'standard',
                data: parsed
            };

            if (options?.mode === 'notes') {
                finalContent = parsed.content;
                if (parsed.flashcards) finalMetadata.flashcards = parsed.flashcards;
                if (parsed.topic) finalMetadata.topic = parsed.topic;
                if (parsed.summary) finalMetadata.summary = parsed.summary;
            } else if (options?.mode === 'mock-test') {
                finalContent = `### ${parsed.testTitle}\n\nHere is your mock test. Please answer the questions below.`;
                // We keep the full questions in data.questions
                // We can also map to old mockTest format if possible, but the new one is richer.
                // Let's rely on the UI handling 'data' for mock-test.
            } else {
                // Standard Mode
                finalContent = parsed.content;
                // Map parsed metadata to finalMetadata
                if (parsed.metadata) {
                    finalMetadata = { ...finalMetadata, ...parsed.metadata };
                }
            }

            // Generate Image if illustration is present (for Standard Mode)
            if (finalMetadata.illustration && !finalMetadata.illustration.startsWith("data:image")) {
                const imageBase64 = await generateImage(finalMetadata.illustration);
                if (imageBase64) {
                    finalMetadata.illustration = `data:image/png;base64,${imageBase64}`;
                }
            }

            return {
                role: 'agent',
                content: finalContent,
                metadata: finalMetadata
            };
        } catch (e) {
            console.error("JSON Parse Error", e);
            // Fallback for non-JSON response (shouldn't happen with strict schema, but safe to have)
            return {
                role: 'agent',
                content: responseText,
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
