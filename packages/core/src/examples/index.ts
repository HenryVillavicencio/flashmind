import { prefixes } from "../shared/id";

export namespace Examples {
    export const Id = (prefix: keyof typeof prefixes) =>
        `${prefixes[prefix]}_XXXXXXXXXXXXXXXXXXXXXXXXXX`;

    export const Deck = {
        id: Id("deck"),
        name: "Fundamento de Typescript",       
        description: "Aprende los conceptos de typescript desde 0",
        image: "https://storage.com/ts-image",
    }

    export const Flashcard = {
        id: Id("flashcard"),
        question: "¿Qué es Typescript?",
        answer: "Es un lenguaje de programación de código abierto desarrollado y mantenido por Microsoft. Es un superconjunto sintáctico estricto de JavaScript y agrega tipado estático opcional a lenguajes a la sintaxis al lenguaje.",
        deckId: Id("deck"),
    }
    
    export const FlashcardReview = {
        id: Id("flashcard"),
        rating: 1
    }
}