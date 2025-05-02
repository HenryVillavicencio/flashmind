import { pgTable, text,  real, integer, timestamp, } from "drizzle-orm/pg-core";
import { Drizzle } from "../shared/drizzle";
import { deckTable } from "../deck/deck.sql";

export const flashcardTable = pgTable("flashcard", {
  ...Drizzle.id,
  ...Drizzle.timestamps,
  ...Drizzle.isActive,
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  deckId: Drizzle.ulid("deck_id").notNull().references(() => deckTable.id),
});


export const flashcardAnkiTable = pgTable("flashcard_anki", {
  ...Drizzle.id,
  ...Drizzle.timestamps,
  ...Drizzle.isActive,
  flashcardId: Drizzle.ulid("flashcard_id").notNull().references(() => flashcardTable.id),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
});