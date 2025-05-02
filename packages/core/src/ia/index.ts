import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Deck } from '../deck';
import { Flashcard } from '../flashcard';
import { Config } from '../shared/config';



export namespace IA {

    const google = createGoogleGenerativeAI({
        apiKey: Config.GEMINI_API_KEY
    });

    export async function generateDeckAndFlashcards(instructions: string): Promise<string> {
        const prompt = `Generate a deck and flashcards based on the following instructions. The output should be a JSON object with a 'deck' field and a 'flashcards' array. 
        The 'deck' object should have 'name', 'description', and optionally 'image' fields. The 'flashcards' array should contain objects with 'question' and 'answer' fields.
         Do not include any extra text or markdown outside the JSON.
        Instructions: ${instructions}

        Output format:
        {
        "deck": {
            "name": "string",
            "description": "string",
            "image"?: "string"
        },
        "flashcards": [
            {
            "question": "string",
            "answer": "string"
            }
        ]
        }`;

        const result = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: prompt,
            maxTokens: 4000,
        });
        const cleanedText = result.text.replace(/```json\s*|\s*```/g, '').trim();
        const jsonResult = JSON.parse(cleanedText);

        const deck = Deck.InfoSchema.omit({ id: true }).parse(jsonResult.deck);
        const flashcards = Flashcard.InfoSchema.omit({ id: true, deckId: true }).array().parse(jsonResult.flashcards);


        const deckId = await Deck.create(deck);

        await Promise.all(flashcards.map(async (flashcard) => {
            return Flashcard.create({ ...flashcard, deckId });
        }));

        return deckId;

    }
}