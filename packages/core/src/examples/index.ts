import { prefixes } from "../shared/id";

export namespace Examples {
    export const Id = (prefix: keyof typeof prefixes) =>
        `${prefixes[prefix]}_XXXXXXXXXXXXXXXXXXXXXXXXX`;


    export const Deck = {
        id: Id("deck"),
        name: "Fundamento de Typescript",       
        description: "Aprende los conceptos de typescript desde 0",
        image: "https://storage.com/ts-image",
    }

}