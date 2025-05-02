import { z } from "zod";
import { Common } from '../shared/common';
import { Examples } from "../examples";
import { Drizzle } from "../shared/drizzle";
import { flashcardAnkiTable, flashcardTable } from "./flashcard.sql";
import { and, eq, lt } from "drizzle-orm";
import { fn } from "../shared/fn";
import { createID } from "../shared/id";

export namespace Flashcard {

    export const InfoSchema = z
        .object({
            id: z.string().openapi({
                description: Common.IdDescription,
                example: Examples.Flashcard.id,
            }),
            question: z.string().openapi({
                description: "Question of the flashcard.",
                example: Examples.Flashcard.question,
            }),
            answer: z.string().openapi({
                description: "Answer of the flashcard.",
                example: Examples.Flashcard.answer,
            }),
            deckId: z.string().openapi({
                description: "ID of the deck the flashcard belongs to.",
                example: Examples.Deck.id,
            }),
        })
        .openapi({
            ref: "Flashcard",
            description: "A flashcard with a question and answer.",
            example: Examples.Flashcard,
        });

    export type InfoType = z.infer<typeof InfoSchema>

    function serialize(
        input: typeof flashcardTable.$inferSelect
    ): InfoType {
        return {
            id: input.id,
            question: input.question,
            answer: input.answer,
            deckId: input.deckId,
        };
    }

    export const list = fn(z.object({ deckId: z.string() }), async ({ deckId }) => {
        const select = await Drizzle.db.select().from(flashcardTable)
            .where(and(eq(flashcardTable.isActive, true), eq(flashcardTable.deckId, deckId)));
        return select.map(serialize);
    });

    export const create = fn(InfoSchema.partial({ id: true }), async (data) => {
        const id = data.id || createID("flashcard");
        await Drizzle.db.insert(flashcardTable).values({ ...data, id });
        await Drizzle.db.insert(flashcardAnkiTable).values({ flashcardId: id, id });
        return id;
    });

    export const update = fn(InfoSchema, async (data) => {
        await Drizzle.db.update(flashcardTable).set({ ...data, timeUpdated: new Date() })
            .where(eq(flashcardTable.id, data.id));
        return data.id;
    });

    export const getDetail = fn(InfoSchema.pick({ id: true }), async ({ id }) => {
        const select = await Drizzle.db.select().from(flashcardTable).where(
            and(
                eq(flashcardTable.id, id),
                eq(flashcardTable.isActive, true)
            )
        );
        return select.map(serialize).at(0);
    });

    export const deactivate = fn(InfoSchema.pick({ id: true }), async ({ id }) => {
        await Drizzle.db.update(flashcardTable).set({ isActive: false, timeDeleted: new Date() })
            .where(eq(flashcardTable.id, id));
        return id;
    });

    export const ReviewSchema = z.object({
        id: z.string().openapi({
            description: Common.IdDescription,
            example: Examples.FlashcardReview.id,
        }), 
        rating: z.number().min(0).max(3).openapi({
            description: "Rating of the flashcard. 0:Forgot, 1:Hard, 2:Good, 3:Easy",
            example: Examples.FlashcardReview.rating,
        }) 
    }).openapi({
        ref: "AnkiReview",
        description: "A review of a flashcard.",
        example: Examples.FlashcardReview,
    });
    
    export const recordReview = fn(ReviewSchema, async ({ id, rating }) => {
        const flashcardAnki = await Drizzle.db.select().from(flashcardAnkiTable).where(eq(flashcardAnkiTable.flashcardId, id)).limit(1).then(rows => rows[0]);

        if (!flashcardAnki) {
            throw new Error("Flashcard Anki data not found");
        }

        let newIntervalDays: number;
        let newEaseFactor = flashcardAnki.easeFactor;
        let newRepetitions = flashcardAnki.repetitions;

        if (rating === 0) { // Forgot
            newRepetitions = 0;
            newIntervalDays = 0;
            newEaseFactor = flashcardAnki.easeFactor - 0.2 > 1.3 ? flashcardAnki.easeFactor - 0.2 : 1.3; // Decrease ease factor, minimum 1.3
        } else {
            newRepetitions++;

            if (newRepetitions <= 1) {
                newIntervalDays = 1; // First successful repetition
            } else if (newRepetitions === 2) {
                newIntervalDays = 6; // Second successful repetition
            } else {
                newIntervalDays = Math.round(flashcardAnki.intervalDays * flashcardAnki.easeFactor);
            }

            if (rating === 1) { // Hard
                newEaseFactor = flashcardAnki.easeFactor - 0.15;
                 // No change to interval for Hard in SM-2
            } else if (rating === 3) { // Easy
                newEaseFactor = flashcardAnki.easeFactor + 0.15;
                 newIntervalDays = Math.round(newIntervalDays * 1.3); // Increase interval slightly for Easy
            }
        }

        // Ensure ease factor doesn't go below 1.3
        newEaseFactor = Math.max(1.3, newEaseFactor);

        // Calculate next review date
        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + newIntervalDays);

        await Drizzle.db.update(flashcardAnkiTable).set({
            easeFactor: newEaseFactor,
            intervalDays: newIntervalDays,
            repetitions: newRepetitions,
            nextReviewAt: nextReviewAt,
            timeUpdated: new Date(),
        }).where(eq(flashcardAnkiTable.flashcardId, id));

        return id;
    });

    export const listDue = fn(z.object({ deckId: z.string() }), async ({ deckId }) => {
        const select = await Drizzle.db.select({
            id: flashcardTable.id,
            question: flashcardTable.question,
            answer: flashcardTable.answer,
            deckId: flashcardTable.deckId,
        })
        .from(flashcardAnkiTable)
        .innerJoin(flashcardTable, eq(flashcardAnkiTable.flashcardId, flashcardTable.id))
        .where(and(
            eq(flashcardTable.deckId, deckId),
            eq(flashcardTable.isActive, true),
            lt(flashcardAnkiTable.nextReviewAt, new Date())
        ));
        return select;
    });

}

