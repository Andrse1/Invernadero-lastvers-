import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { co2Humedad, co2Temperatura, co2Concentracion } from "@db/schema";
import { desc, gte, lte, and } from "drizzle-orm";

export const co2Router = createRouter({
  // Humedad - ultimas 20 para grafico de barras historico
  humedadHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      return db.select().from(co2Humedad).orderBy(desc(co2Humedad.fechaLectura)).limit(limit);
    }),

  // Humedad - ultimas 50 para tabla historica
  humedadTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Humedad).orderBy(desc(co2Humedad.fechaLectura)).limit(50);
    }),

  // Humedad - filtrar por rango de fechas para CSV
  humedadRango: publicQuery
    .input(z.object({
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(co2Humedad.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(co2Humedad.fechaLectura, new Date(input.hasta)));
      return db.select().from(co2Humedad)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(co2Humedad.fechaLectura));
    }),

  // Humedad - insertar nuevo dato
  humedadInsertar: publicQuery
    .input(z.object({ humedad: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(co2Humedad).values({ humedad: input.humedad });
    }),

  // Humedad - ultimo valor (para tiempo real)
  humedadUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Humedad).orderBy(desc(co2Humedad.fechaLectura)).limit(1);
    }),

  // Temperatura - ultimo valor (termometro en tiempo real)
  temperaturaUltimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Temperatura).orderBy(desc(co2Temperatura.fechaLectura)).limit(1);
    }),

  // Temperatura - ultimos 50 para tabla
  temperaturaTabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Temperatura).orderBy(desc(co2Temperatura.fechaLectura)).limit(50);
    }),

  // Temperatura - historico para grafico
  temperaturaHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      return db.select().from(co2Temperatura).orderBy(desc(co2Temperatura.fechaLectura)).limit(limit);
    }),

  // Temperatura - rango de fechas para CSV
  temperaturaRango: publicQuery
    .input(z.object({
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(co2Temperatura.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(co2Temperatura.fechaLectura, new Date(input.hasta)));
      return db.select().from(co2Temperatura)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(co2Temperatura.fechaLectura));
    }),

  // Temperatura - insertar
  temperaturaInsertar: publicQuery
    .input(z.object({ temperatura: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(co2Temperatura).values({ temperatura: input.temperatura });
    }),

  // CO2 - ultimo valor (termometro en tiempo real)
  co2Ultimo: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Concentracion).orderBy(desc(co2Concentracion.fechaLectura)).limit(1);
    }),

  // CO2 - ultimos 50 para tabla
  co2Tabla: publicQuery
    .query(() => {
      const db = getDb();
      return db.select().from(co2Concentracion).orderBy(desc(co2Concentracion.fechaLectura)).limit(50);
    }),

  // CO2 - historico
  co2Historico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;
      return db.select().from(co2Concentracion).orderBy(desc(co2Concentracion.fechaLectura)).limit(limit);
    }),

  // CO2 - rango de fechas para CSV
  co2Rango: publicQuery
    .input(z.object({
      desde: z.string().datetime().optional(),
      hasta: z.string().datetime().optional(),
    }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(co2Concentracion.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(co2Concentracion.fechaLectura, new Date(input.hasta)));
      return db.select().from(co2Concentracion)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(co2Concentracion.fechaLectura));
    }),

  // CO2 - insertar
  co2Insertar: publicQuery
    .input(z.object({ co2Ppm: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(co2Concentracion).values({ co2Ppm: input.co2Ppm });
    }),
});
