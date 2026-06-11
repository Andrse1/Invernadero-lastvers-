import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { iluminacionPpfd, iluminacionDli, iluminacionEspectro } from "@db/schema";
import { desc, gte, lte, and } from "drizzle-orm";

export const iluminacionRouter = createRouter({
  ppfdUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionPpfd).orderBy(desc(iluminacionPpfd.fechaLectura)).limit(1);
    }),

  ppfdHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      return db.select().from(iluminacionPpfd).orderBy(desc(iluminacionPpfd.fechaLectura)).limit(limit);
    }),

  ppfdTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionPpfd).orderBy(desc(iluminacionPpfd.fechaLectura)).limit(50);
    }),

  ppfdRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(iluminacionPpfd.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(iluminacionPpfd.fechaLectura, new Date(input.hasta)));
      return db.select().from(iluminacionPpfd)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(iluminacionPpfd.fechaLectura));
    }),

  ppfdInsertar: publicQuery
    .input(z.object({ ppfd: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(iluminacionPpfd).values({ ppfd: input.ppfd });
    }),

  dliUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionDli).orderBy(desc(iluminacionDli.fechaLectura)).limit(1);
    }),

  dliHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      return db.select().from(iluminacionDli).orderBy(desc(iluminacionDli.fechaLectura)).limit(limit);
    }),

  dliTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionDli).orderBy(desc(iluminacionDli.fechaLectura)).limit(50);
    }),

  dliRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(iluminacionDli.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(iluminacionDli.fechaLectura, new Date(input.hasta)));
      return db.select().from(iluminacionDli)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(iluminacionDli.fechaLectura));
    }),

  dliInsertar: publicQuery
    .input(z.object({
      dliAcumulado: z.number(),
      dliTotal: z.number(),
      dliObjetivo: z.number(),
      porcentaje: z.number(),
      excedente: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(iluminacionDli).values({
        dliAcumulado: input.dliAcumulado,
        dliTotal: input.dliTotal,
        dliObjetivo: input.dliObjetivo,
        porcentaje: input.porcentaje,
        excedente: input.excedente ?? 0,
      });
    }),

  espectroUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionEspectro).orderBy(desc(iluminacionEspectro.fechaLectura)).limit(1);
    }),

  espectroHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 50;
      return db.select().from(iluminacionEspectro).orderBy(desc(iluminacionEspectro.fechaLectura)).limit(limit);
    }),

  espectroTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(iluminacionEspectro).orderBy(desc(iluminacionEspectro.fechaLectura)).limit(50);
    }),

  espectroRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(iluminacionEspectro.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(iluminacionEspectro.fechaLectura, new Date(input.hasta)));
      return db.select().from(iluminacionEspectro)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(iluminacionEspectro.fechaLectura));
    }),

  espectroInsertar: publicQuery
    .input(z.object({
      ch0: z.number(), ch1: z.number(), ch2: z.number(), ch3: z.number(),
      ch4: z.number(), ch5: z.number(), ch6: z.number(), ch7: z.number(),
      canalDominante: z.string().optional(),
      focoEstado: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(iluminacionEspectro).values({
        ch0: input.ch0, ch1: input.ch1, ch2: input.ch2, ch3: input.ch3,
        ch4: input.ch4, ch5: input.ch5, ch6: input.ch6, ch7: input.ch7,
        canalDominante: input.canalDominante ?? "—",
        focoEstado: input.focoEstado ?? "OFF",
      });
    }),
});
