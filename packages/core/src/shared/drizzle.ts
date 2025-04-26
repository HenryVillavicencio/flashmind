import { sql } from "drizzle-orm";
import { char, timestamp, boolean } from "drizzle-orm/pg-core";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Config } from "./config";

export namespace Drizzle {

    export const client = neon(Config.DATABASE_URL);

    export const db = drizzle({ client });


    export const ulid = (name: string) => char(name, { length: 26 + 4 });

    export const id = {
        get id() {
            return ulid("id").primaryKey();
        },
    };

    export const timestamps = {
        timeCreated: timestamp("time_created").notNull().defaultNow(),
        timeUpdated: timestamp("time_updated")
            .notNull()
            .default(sql`CURRENT_TIMESTAMP(3)`), 
        timeDeleted: timestamp("time_deleted"),
    };

    export const isActive = {
        isActive: boolean("is_active").notNull().default(true)
    }

}