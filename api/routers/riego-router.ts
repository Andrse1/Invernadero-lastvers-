import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import {
  riegoTempSuelo, riegoTempAmbiente, riegoHumAmbiente,
  riegoHumSuelo, riegoPotasio, riegoFosforo, riegoNitrogeno,
} from "@db/schema";
import { desc, gte, lte, and } from "drizzle-orm";

export const riegoRouter = createRouter({
  // --- TEMPERATURA SUELO ---
  tempSueloUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoTempSuelo).orderBy(desc(riegoTempSuelo.fechaLectura)).limit(1);
  }),
  tempSueloHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoTempSuelo).orderBy(desc(riegoTempSuelo.fechaLectura)).limit(input?.limit ?? 50);
    }),
  tempSueloTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoTempSuelo).orderBy(desc(riegoTempSuelo.fechaLectura)).limit(50);
  }),
  tempSueloRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoTempSuelo.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoTempSuelo.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoTempSuelo).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoTempSuelo.fechaLectura));
    }),
  tempSueloInsertar: publicQuery
    .input(z.object({ temperaturaSuelo: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoTempSuelo).values({ temperaturaSuelo: input.temperaturaSuelo });
    }),

  // --- TEMPERATURA AMBIENTE ---
  tempAmbienteUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoTempAmbiente).orderBy(desc(riegoTempAmbiente.fechaLectura)).limit(1);
  }),
  tempAmbienteHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoTempAmbiente).orderBy(desc(riegoTempAmbiente.fechaLectura)).limit(input?.limit ?? 50);
    }),
  tempAmbienteTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoTempAmbiente).orderBy(desc(riegoTempAmbiente.fechaLectura)).limit(50);
  }),
  tempAmbienteRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoTempAmbiente.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoTempAmbiente.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoTempAmbiente).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoTempAmbiente.fechaLectura));
    }),
  tempAmbienteInsertar: publicQuery
    .input(z.object({ temperaturaAmbiente: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoTempAmbiente).values({ temperaturaAmbiente: input.temperaturaAmbiente });
    }),

  // --- HUMEDAD AMBIENTE ---
  humAmbienteUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoHumAmbiente).orderBy(desc(riegoHumAmbiente.fechaLectura)).limit(1);
  }),
  humAmbienteHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoHumAmbiente).orderBy(desc(riegoHumAmbiente.fechaLectura)).limit(input?.limit ?? 50);
    }),
  humAmbienteTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoHumAmbiente).orderBy(desc(riegoHumAmbiente.fechaLectura)).limit(50);
  }),
  humAmbienteRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoHumAmbiente.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoHumAmbiente.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoHumAmbiente).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoHumAmbiente.fechaLectura));
    }),
  humAmbienteInsertar: publicQuery
    .input(z.object({ humedadAmbiente: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoHumAmbiente).values({ humedadAmbiente: input.humedadAmbiente });
    }),

  // --- HUMEDAD SUELO ---
  humSueloUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoHumSuelo).orderBy(desc(riegoHumSuelo.fechaLectura)).limit(1);
  }),
  humSueloHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoHumSuelo).orderBy(desc(riegoHumSuelo.fechaLectura)).limit(input?.limit ?? 50);
    }),
  humSueloTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoHumSuelo).orderBy(desc(riegoHumSuelo.fechaLectura)).limit(50);
  }),
  humSueloRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoHumSuelo.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoHumSuelo.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoHumSuelo).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoHumSuelo.fechaLectura));
    }),
  humSueloInsertar: publicQuery
    .input(z.object({ humedadSuelo: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoHumSuelo).values({ humedadSuelo: input.humedadSuelo });
    }),

  // --- POTASIO ---
  potasioUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoPotasio).orderBy(desc(riegoPotasio.fechaLectura)).limit(1);
  }),
  potasioHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoPotasio).orderBy(desc(riegoPotasio.fechaLectura)).limit(input?.limit ?? 50);
    }),
  potasioTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoPotasio).orderBy(desc(riegoPotasio.fechaLectura)).limit(50);
  }),
  potasioRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoPotasio.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoPotasio.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoPotasio).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoPotasio.fechaLectura));
    }),
  potasioInsertar: publicQuery
    .input(z.object({ potasio: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoPotasio).values({ potasio: input.potasio });
    }),

  // --- FOSFORO ---
  fosforoUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoFosforo).orderBy(desc(riegoFosforo.fechaLectura)).limit(1);
  }),
  fosforoHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoFosforo).orderBy(desc(riegoFosforo.fechaLectura)).limit(input?.limit ?? 50);
    }),
  fosforoTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoFosforo).orderBy(desc(riegoFosforo.fechaLectura)).limit(50);
  }),
  fosforoRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoFosforo.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoFosforo.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoFosforo).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoFosforo.fechaLectura));
    }),
  fosforoInsertar: publicQuery
    .input(z.object({ fosforo: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoFosforo).values({ fosforo: input.fosforo });
    }),

  // --- NITROGENO ---
  nitrogenoUltimo: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoNitrogeno).orderBy(desc(riegoNitrogeno.fechaLectura)).limit(1);
  }),
  nitrogenoHistorico: publicQuery
    .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
    .query(({ input }) => {
      const db = getDb();
      return db.select().from(riegoNitrogeno).orderBy(desc(riegoNitrogeno.fechaLectura)).limit(input?.limit ?? 50);
    }),
  nitrogenoTabla: publicQuery.query(() => {
    const db = getDb();
    return db.select().from(riegoNitrogeno).orderBy(desc(riegoNitrogeno.fechaLectura)).limit(50);
  }),
  nitrogenoRango: publicQuery
    .input(z.object({ desde: z.string().datetime().optional(), hasta: z.string().datetime().optional() }))
    .mutation(({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.desde) conditions.push(gte(riegoNitrogeno.fechaLectura, new Date(input.desde)));
      if (input.hasta) conditions.push(lte(riegoNitrogeno.fechaLectura, new Date(input.hasta)));
      return db.select().from(riegoNitrogeno).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(riegoNitrogeno.fechaLectura));
    }),
  nitrogenoInsertar: publicQuery
    .input(z.object({ nitrogeno: z.number() }))
    .mutation(({ input }) => {
      const db = getDb();
      return db.insert(riegoNitrogeno).values({ nitrogeno: input.nitrogeno });
    }),
});
