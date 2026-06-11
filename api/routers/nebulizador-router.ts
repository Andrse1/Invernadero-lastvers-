import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { nebulizadorHumedad } from "@db/schema";
import { desc, gte, lte, and } from "drizzle-orm";

export const nebulizadorRouter = createRouter({
  humedadHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      return db.select().from(nebulizadorHumedad).orderBy(desc(nebulizadorHumedad.fechaLectura)).limit(limit);
    }),

  humedadTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(nebulizadorHumedad).orderBy(desc(nebulizadorHumedad.fechaLectura)).limit(50);
    }),

  humedadRango: publicQuery
    .input(z.object({
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(nebulizadorHumedad.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(nebulizadorHumedad.fechaLectura, new Date(input.hasta)));
      return db.select().from(nebulizadorHumedad)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(nebulizadorHumedad.fechaLectura));
    }),

  humedadInsertar: publicQuery
    .input(z.object({ humedad: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(nebulizadorHumedad).values({ humedad: input.humedad });
    }),

  humedadUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(nebulizadorHumedad).orderBy(desc(nebulizadorHumedad.fechaLectura)).limit(1);
    }),
});
