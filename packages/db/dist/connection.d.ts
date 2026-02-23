import * as schema from "./schema.js";
export declare function getDb(connectionStringOverride?: string): import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
export type Database = ReturnType<typeof getDb>;
export declare function closeDb(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map