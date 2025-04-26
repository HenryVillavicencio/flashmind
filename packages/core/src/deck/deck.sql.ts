import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { Drizzle } from "../shared/drizzle";

export const deckTable = pgTable("deck", {
  ...Drizzle.id,
  ...Drizzle.timestamps,
  ...Drizzle.isActive,
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 612 }),
});