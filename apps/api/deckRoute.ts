import { Hono } from 'hono'

export const deckRoute = new Hono();

deckRoute
    .post('/', (c) => {
        return c.json({ data: "Ok" }, 201)
    })
    .get('/', (c) => {
        return c.json({
            data: [
                {
                    id: "123",
                    name: "Typescript",
                    description: "Fundamentod de typescript",
                    image: null
                },
                {
                    id: "2222",
                    name: "Matemáticas",
                    description: "Introcucción a a funciones idenpotentes",
                    image: null
                }
            ]
        }, 200)
    })
    .get("/:id", (c) => {

        const id = c.req.param("id");
        return c.json({
            data: {
                id: id,
                name: "Typescript",
                description: "Fundamentod de typescript",
                image: null
            }
        }, 200)
    })
    .put("/:id", (c) => {
        return c.json({ data: "Ok" }, 200)
    })
    .delete("/:id", (c) => {
        return c.body(null, 204)
    })

