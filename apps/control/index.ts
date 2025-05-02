import { create } from 'opencontrol';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Config } from '@flashmind/core/src/shared/config';
import { tool } from 'opencontrol/tool';
import { z } from 'zod';

const apiCall = tool({
    name: "apiCall",
    description: "Realiza una llamada al API de la aplicación",
    args: z.object({
        method: z.string().describe("Método HTTP a utilizar"),
        path: z.string().describe("Ruta a llamar"),
        query: z.record(z.string()).optional().describe("Parámetros de consulta"),
        contentType: z.string().optional().describe("Tipo de contenido HTTP a utilizar"),
        body: z.string().optional().describe("Cuerpo HTTP a utilizar si no es GET"),
    }),
    async run(input) {
        const url = new URL("http://localhost:3001" + input.path);
        if (input.query) url.search = new URLSearchParams(input.query).toString();
        const response = await fetch(url.toString(), {
            method: input.method,
            headers: {
                "Content-Type": input.contentType || "application/json",
            },
            body: input.body ? input.body : undefined,
        });
        if (!response.ok) throw new Error(await response.text());
        return response.text();
    },
});

const getOpenApiDocs = tool({
    name: "getOpenApiDocs",
    description: "Obtiene la documentación OpenAPI del servicio",
    args: z.object({}),
    async run() {
        const response = await fetch("http://localhost:3001/openapi");
        if (!response.ok) throw new Error("No se pudo obtener la documentación OpenAPI");
        return response.text();
    },
});

const control = create({
    model: createGoogleGenerativeAI({
        apiKey: Config.GEMINI_API_KEY,
    })("gemini-2.0-flash"),
    tools: [apiCall, getOpenApiDocs],
});

export default control;