import { createRouter, publicQuery } from "./middleware";
import { co2Router } from "./routers/co2-router";
import { nebulizadorRouter } from "./routers/nebulizador-router";
import { iluminacionRouter } from "./routers/iluminacion-router";
import { riegoRouter } from "./routers/riego-router";
import { fotovoltaicoRouter } from "./routers/fotovoltaico-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  co2: co2Router,
  nebulizador: nebulizadorRouter,
  iluminacion: iluminacionRouter,
  riego: riegoRouter,
  fotovoltaico: fotovoltaicoRouter,
});

export type AppRouter = typeof appRouter;
