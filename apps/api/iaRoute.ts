import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses, validator } from './common';
import { IA } from '@flashmind/core';

export const iaRoute = new Hono();

iaRoute
    .post('/generate',
        describeRoute({
            tags: ["IA"],
            summary: "Generar deck y flashcards con IA",
            description: 'Genera un deck y sus flashcards a partir de instrucciones dadas a la IA.',
            requestBody: {
                content: {
                    "application/json": {
                        schema: resolver(z.object({
                            instructions: z.string().openapi({
                                description: "Instrucciones para la IA",
                                example: "Genera un deck sobre componentes de una computadora"
                            })
                        })),
                    }
                }
            },
            responses: {
                201: {
                    description: 'Generación iniciada exitosamente',
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
        validator("json", z.object({
            instructions: z.string()
        }).openapi({
            description: "Instrucciones para la IA",
            example: { instructions: "Genera un deck sobre componentes de una computadora" }
        })),
        async (c) => {
            const body = c.req.valid("json");
            await IA.generateDeckAndFlashcards(body.instructions);
            return c.json({ data: "Ok" }, 201);
        });