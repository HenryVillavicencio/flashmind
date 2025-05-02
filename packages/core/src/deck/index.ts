import { z } from "zod";
import { Common } from '../shared/common';
import { Examples } from "../examples";
import { Drizzle } from "../shared/drizzle";
import { deckTable } from "./deck.sql";
import { and, eq } from "drizzle-orm";
import { fn } from "../shared/fn";
import { createID } from "../shared/id";

export namespace Deck {

    export const InfoSchema = z
        .object({
            id: z.string().openapi({
                description: Common.IdDescription,
                example: Examples.Deck.id,
            }),
            name: z.string().openapi({
                description: "Name of the deck.",
                example: Examples.Deck.name,
            }),
            description: z.string().openapi({
                description: "Description of the deck.",
                example: Examples.Deck.description,
            }),
            image: z.string().url().nullish().openapi({
                description: "URL of the deck image.",
                example: Examples.Deck.image,
            }),
        })
        .openapi({
            ref: "Deck",
            description: "A collection of cards with a theme or purpose.",
            example: Examples.Deck,
        });

    export type InfoType = z.infer<typeof InfoSchema>

    function serialize(
        input: typeof deckTable.$inferSelect
    ): InfoType {
        return {
            id: input.id,
            name: input.name,
            description: input.description,
            image: input.image,
        };
    }

    export const list = async () => {
        const select = await Drizzle.db.select().from(deckTable).where(eq(deckTable.isActive, true))
        return select.map(serialize)
    }

    export const create = fn(InfoSchema.partial({ id: true }), async (data) => {
        const id = data.id || createID("deck");
        await Drizzle.db.insert(deckTable).values({ ...data, id });
        return id;
    })

    export const update = fn(InfoSchema, async (data) => {
        await Drizzle.db.update(deckTable).set({ ...data, timeUpdated: new Date() })
            .where(eq(deckTable.id, data.id));
        return data.id;
    });

    export const getDetail = fn(InfoSchema.pick({ id: true }), async ({ id }) => {
        const select = await Drizzle.db.select().from(deckTable).where(
            and(
                eq(deckTable.id, id),
                eq(deckTable.isActive, true)
            )
        )
        return select.map(serialize).at(0)
    });

    export const deactivate = fn(InfoSchema.pick({ id: true }), async ({ id }) => {
        await Drizzle.db.update(deckTable).set({ isActive: false, timeDeleted: new Date() })
            .where(eq(deckTable.id, id));
        return id;
    });


}