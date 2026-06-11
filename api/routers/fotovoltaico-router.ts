import { createRouter, publicQuery } from "../middleware";

export const fotovoltaicoRouter = createRouter({
  // Proyecto en construccion - placeholder
  status: publicQuery.query(() => ({
    estado: "en_construccion",
    mensaje: "Sistema Fotovoltaico - Modulo en desarrollo",
    proximamente: [
      "Monitoreo de paneles solares",
      "Eficiencia energetica",
      "Produccion de energia en tiempo real",
      "Historial de generacion",
    ],
  })),
});
