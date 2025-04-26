// import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { Deck, Examples } from "@flashmind/core"
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses, validator } from './common';

export const deckRoute = new Hono();

deckRoute
    .post('/',
        describeRoute({
            tags: ["Deck"],
            summary: "Crea un deck",
            description: 'Crea un deck para el usuario',
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(Deck.InfoSchema),
                        example: Examples.Deck
                    }
                }
            },
            responses: {
                201: {
                    description: 'Respuesta exitosa',
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: z.literal("Ok")
                            })),
                            example: { data: "Ok" },
                        },
                    },
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        validator("json", Deck.InfoSchema),
        async (c) => {
            const body = c.req.valid("json");
            await Deck.create(body);
            return c.json({ data: "Ok" }, 201)
        })
    .get('/',
        describeRoute(
            {
                tags: ["Deck"],
                summary: "Lista los decks",
                description: "List todos los decks de estudio de un usuario.",
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    data: Deck.InfoSchema.array().openapi({
                                        description: "Lista de decks",
                                        example: [Examples.Deck]
                                    })
                                })),
                                example: {
                                    data: [Examples.Deck]
                                }
                            }
                        },
                        description: "A list of decks.",
                    },
                    500: ErrorResponses[500],
                }
            }
        ),
        async (c) => {
            const decks = await Deck.list();
            return c.json({ data: decks }, 200)
        })
    .get("/:id",
        describeRoute({
            tags: ["Deck"],
            summary: "Obtener deck por ID",
            description: "Recupera un deck específico por su ID.",
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Deck.InfoSchema
                            })),
                            example: { data: Examples.Deck },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Deck.InfoSchema.pick({ id: true })),
        async (c) => {
            const id = c.req.valid("param").id;
            const deck = await Deck.getDetail({ id });

            if (!deck) {
                return c.json({
                    type: "not_found",
                    code: "resource_not_found",
                    message: "The requested resource could not be found",
                }, 404);
            }

            return c.json({ data: deck }, 200);
        })
    .put("/:id",
        describeRoute({
            tags: ["Deck"],
            summary: "Actualizar deck por ID",
            description: "Actualiza un deck existente identificado por su ID.",
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(Deck.InfoSchema),
                        example: Examples.Deck
                    }
                }
            },
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Deck.InfoSchema
                            })),
                            example: { data: Examples.Deck },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("json", Deck.InfoSchema),
        async (c) => {
            const id = c.req.param("id")
            const body = c.req.valid("json")
            await Deck.update({ ...body, id })
            return c.json({ data: "Ok" }, 200)
        })
    .delete("/:id",
        describeRoute({
            tags: ["Deck"],
            summary: "Eliminar deck por ID",
            description: "Elimina un deck por su ID.",
            responses: {
                204: {
                    description: "Sin Contenido. Deck eliminado exitosamente.",
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Deck.InfoSchema.pick({ id: true })),
        async (c) => {
            const id = c.req.param("id")
            await Deck.deactivate({ id })
            return c.body(null, 204)
        })

