import { z } from "zod";

export const NotesSchema = z.object({
    topic: z.string().describe("The main topic of the notes."),
    content: z.string().describe("The main content of the notes in Markdown format. This must be a deep, comprehensive explanation of the topic, explaining it to its roots. Include examples, analogies, and key points. Use headers, bullet points, and bold text for readability."),
    summary: z.string().describe("A concise summary of the notes."),
    flashcards: z.array(z.object({
        front: z.string().describe("The term or concept on the front of the flashcard."),
        back: z.string().describe("The definition or explanation on the back of the flashcard.")
    })).describe("A list of flashcards for key concepts found in the notes.")
});

export const MockTestQuestionSchema = z.object({
    id: z.string().describe("A unique identifier for the question."),
    type: z.enum(['objective', 'theoretical', 'numerical']).describe("The type of question."),
    question: z.string().describe("The question text."),
    options: z.array(z.string()).optional().describe("Options for objective questions. Required if type is 'objective'."),
    answer: z.string().optional().describe("The correct answer for objective questions."),
    solution: z.string().optional().describe("The detailed solution for theoretical or numerical questions."),
    marks: z.number().describe("The marks assigned to this question.")
});

export const MockTestSchema = z.object({
    testTitle: z.string().describe("The title of the mock test."),
    questions: z.array(MockTestQuestionSchema).describe("The list of questions in the mock test.")
});

export const StandardResponseSchema = z.object({
    content: z.string().describe("The main response content in Markdown format."),
    metadata: z.object({
        tricks: z.array(z.string()).optional().describe("List of memory tricks or mnemonics."),
        illustration: z.string().optional().describe("A detailed description of a simple, black-and-white line drawing that would help explain this concept."),
        videos: z.array(z.object({
            id: z.string(),
            title: z.string(),
            url: z.string(),
            thumbnail: z.string()
        })).optional().describe("List of helpful YouTube videos."),
        quiz: z.object({
            question: z.string(),
            options: z.array(z.string()),
            answer: z.string()
        }).optional().describe("A quick quiz question to test understanding."),
        references: z.array(z.object({
            title: z.string(),
            url: z.string()
        })).optional().describe("List of references or sources.")
    }).optional().describe("Optional metadata for the response.")
});

export type Notes = z.infer<typeof NotesSchema>;
export type MockTest = z.infer<typeof MockTestSchema>;
export type MockTestQuestion = z.infer<typeof MockTestQuestionSchema>;
export type StandardResponse = z.infer<typeof StandardResponseSchema>;
