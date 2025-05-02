// import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { Flashcard, Examples } from "@flashmind/core"
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses, validator } from './common';


export const flashcardRoute = new Hono();

flashcardRoute
    .post('/',
        describeRoute({
            tags: ["Flashcard"],
            summary: "Crea un flashcard",
            description: 'Crea un flashcard para un deck',
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(Flashcard.InfoSchema.partial({ id: true })),
                        example: Examples.Flashcard
                    }
                }
            },
            responses: {
                201: {
                    description: 'Respuesta exitosa',
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: z.string()
                            })),
                            example: { data: Examples.Flashcard.id },
                        },
                    },
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        validator("json", Flashcard.InfoSchema.partial({ id: true })),
        async (c) => {
            const body = c.req.valid("json");
            const id = await Flashcard.create(body);
            return c.json({ data: id }, 201)
        })
    .get('/',
        describeRoute(
            {
                tags: ["Flashcard"],
                summary: "Lista los flashcards de un deck",
                description: "List todos los flashcards de un deck de estudio.",
                parameters: [
                    {
                        in: 'query',
                        name: 'deckId',
                        schema: resolver(z.string()),
                        required: true,
                        description: 'ID del deck',
                    },
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    data: Flashcard.InfoSchema.array().openapi({
                                        description: "Lista de flashcards",
                                        example: [Examples.Flashcard]
                                    })
                                })),
                                example: {
                                    data: [Examples.Flashcard]
                                }
                            }
                        },
                        description: "A list of flashcards.",
                    },
                    400: ErrorResponses[400],
                    500: ErrorResponses[500],
                }
            }
        ),
        validator("query", z.object({ deckId: z.string() })),
        async (c) => {
            const { deckId } = c.req.valid("query");
            const flashcards = await Flashcard.list({ deckId });
            return c.json({ data: flashcards }, 200)
        })
    .get("/:id",
        describeRoute({
            tags: ["Flashcard"],
            summary: "Obtener flashcard por ID",
            description: "Recupera un flashcard específico por su ID.",
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Flashcard.InfoSchema
                            })),
                            example: { data: Examples.Flashcard },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Flashcard.InfoSchema.pick({ id: true })),
        async (c) => {
            const id = c.req.valid("param").id;
            const flashcard = await Flashcard.getDetail({ id });

            if (!flashcard) {
                return c.json({
                    type: "not_found",
                    code: "resource_not_found",
                    message: "The requested resource could not be found",
                }, 404);
            }

            return c.json({ data: flashcard }, 200);
        })
    .put("/:id",
        describeRoute({
            tags: ["Flashcard"],
            summary: "Actualizar flashcard por ID",
            description: "Actualiza un flashcard existente identificado por su ID.",
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(Flashcard.InfoSchema),
                        example: Examples.Flashcard
                    }
                }
            },
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Flashcard.InfoSchema
                            })),
                            example: { data: Examples.Flashcard },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("json", Flashcard.InfoSchema),
        async (c) => {
            const id = c.req.param("id")
            const body = c.req.valid("json")
            await Flashcard.update({ ...body, id })
            return c.json({ data: "Ok" }, 200) // Or return the updated flashcard? Following deckRoute for now.
        })
    .delete("/:id",
        describeRoute({
            tags: ["Flashcard"],
            summary: "Eliminar flashcard por ID",
            description: "Elimina un flashcard por su ID.",
            responses: {
                204: {
                    description: "Sin Contenido. Flashcard eliminado exitosamente.",
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Flashcard.InfoSchema.pick({ id: true })),
        async (c) => {
            const id = c.req.param("id")
            await Flashcard.deactivate({ id })
            return c.body(null, 204)
        })
    .post('/anki/review',
        describeRoute({
            tags: ["Flashcard"],
            summary: "Registrar revisión de flashcard Anki",
            description: 'Registra el resultado de una revisión de flashcard según el algoritmo Anki.',
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(Flashcard.ReviewSchema),
                        example: Examples.FlashcardReview
                    }
                }
            },
            responses: {
                200: {
                    description: 'Revisión registrada exitosamente',
                    content: {
                        "application/json": {
                            schema: resolver(z.object({ data: z.string() })),
                            example: { data: Examples.Flashcard.id },
                        },
                    },
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        validator("json", Flashcard.ReviewSchema),
        async (c) => {
            const body = c.req.valid("json");
            const flashcardId = await Flashcard.recordReview(body);
            return c.json({ data: flashcardId }, 200)
        })
    .get('/anki/due',
        describeRoute({
            tags: ["Flashcard"],
            summary: "Listar flashcards Anki pendientes de revisión",
            description: 'Lista los flashcards de un deck que están pendientes de revisión según el algoritmo Anki.',
            responses: {
                200: {
                    description: 'Lista de flashcards pendientes de revisión',
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Flashcard.InfoSchema.array().openapi({
                                    description: "Lista de flashcards",
                                    example: [Examples.Flashcard]
                                })
                            })),
                        },
                    },
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        validator("query", z.object({ deckId: Flashcard.ReviewSchema.shape.id })),
        async (c) => {
            const { deckId } = c.req.valid("query");
            const flashcardsDue = await Flashcard.listDue({ deckId });
            return c.json({ data: flashcardsDue }, 200)
        })
    ;

