CREATE TABLE "flashcard_anki" (
	"id" char(30) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
	"time_deleted" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"flashcard_id" char(30) NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard" (
	"id" char(30) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
	"time_deleted" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"deck_id" char(30) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcard_anki" ADD CONSTRAINT "flashcard_anki_flashcard_id_flashcard_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcard"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_deck_id_deck_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."deck"("id") ON DELETE no action ON UPDATE no action;