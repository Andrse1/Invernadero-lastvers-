import { drizzle } from "drizzle-orm/mysql2";
import {
  co2Humedad, co2Temperatura, co2Concentracion,
  nebulizadorHumedad,
  iluminacionPpfd, iluminacionDli, iluminacionEspectro,
  riegoTempSuelo, riegoTempAmbiente, riegoHumAmbiente,
  riegoHumSuelo, riegoPotasio, riegoFosforo, riegoNitrogeno,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/greenhouse";
const db = drizzle(databaseUrl);

async function seed() {
  console.log("Seeding database with sample greenhouse data...");

  const now = new Date();

  // Helper to generate timestamps going backwards
  const timestamps: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 5 * 60000);
    timestamps.push(t);
  }

  // ========== CO2 Project ==========
  console.log("Seeding CO2 project...");
  const co2HumValues = [65, 67, 64, 68, 70, 72, 69, 66, 63, 65, 68, 71, 73, 70, 67, 64, 62, 65, 68, 70, 72, 69, 66, 64, 67, 70, 68, 65, 63, 66];
  const co2TempValues = [22.5, 23.1, 22.8, 23.5, 24.2, 24.8, 24.0, 23.3, 22.9, 23.2, 23.8, 24.5, 25.1, 24.6, 23.9, 23.1, 22.7, 23.0, 23.6, 24.3, 24.9, 24.4, 23.7, 23.2, 22.8, 23.4, 24.0, 23.5, 22.9, 23.3];
  const co2GasValues = [400, 420, 410, 430, 450, 470, 460, 440, 420, 410, 430, 460, 480, 470, 450, 430, 410, 420, 440, 460, 490, 480, 460, 440, 420, 440, 470, 450, 430, 440];

  for (let i = 0; i < 30; i++) {
    await db.insert(co2Humedad).values({ humedad: co2HumValues[i], fechaLectura: timestamps[i] });
    await db.insert(co2Temperatura).values({ temperatura: co2TempValues[i], fechaLectura: timestamps[i] });
    await db.insert(co2Concentracion).values({ co2Ppm: co2GasValues[i], fechaLectura: timestamps[i] });
  }

  // ========== Nebulizador Project ==========
  console.log("Seeding Nebulizador project...");
  const nebHumValues = [78, 80, 82, 85, 83, 81, 79, 77, 75, 76, 78, 80, 84, 86, 84, 82, 80, 78, 76, 77, 79, 81, 85, 83, 81, 79, 77, 78, 80, 82];
  for (let i = 0; i < 30; i++) {
    await db.insert(nebulizadorHumedad).values({ humedad: nebHumValues[i], fechaLectura: timestamps[i] });
  }

  // ========== Iluminacion Project ==========
  console.log("Seeding Iluminacion project...");
  const ppfdValues = [150.5, 180.3, 210.7, 250.2, 280.9, 310.4, 290.6, 260.1, 220.8, 190.4, 170.2, 200.5, 240.3, 270.8, 300.1, 285.4, 255.7, 215.3, 185.6, 165.4, 195.8, 235.6, 265.9, 295.3, 280.7, 250.4, 210.6, 180.9, 160.5, 175.3];
  const dliAcumulado = [0.5, 1.2, 2.1, 3.4, 4.8, 6.3, 7.1, 7.8, 8.2, 8.6, 9.1, 9.8, 10.5, 11.3, 12.2, 13.0, 13.6, 14.1, 14.5, 14.9, 15.4, 16.1, 16.9, 17.8, 18.6, 19.3, 19.8, 20.2, 20.6, 21.0];
  const dliObjetivo = 25.0;

  for (let i = 0; i < 30; i++) {
    const pct = Math.min((dliAcumulado[i] / dliObjetivo) * 100, 100);
    const excedente = dliAcumulado[i] > dliObjetivo ? dliAcumulado[i] - dliObjetivo : 0;
    await db.insert(iluminacionPpfd).values({ ppfd: ppfdValues[i], fechaLectura: timestamps[i] });
    await db.insert(iluminacionDli).values({
      dliAcumulado: dliAcumulado[i],
      dliTotal: dliAcumulado[i] + 2.5,
      dliObjetivo: dliObjetivo,
      porcentaje: parseFloat(pct.toFixed(2)),
      excedente: parseFloat(excedente.toFixed(2)),
      fechaLectura: timestamps[i],
    });
  }

  // Espectro data
  const canalesNombres = ["Violeta", "Indigo", "Azul", "Cian", "Verde", "Amarillo", "Naranja", "Rojo"];
  const canalesBase = [120, 180, 250, 200, 350, 280, 420, 380];
  for (let i = 0; i < 30; i++) {
    const chValues = canalesBase.map(base => Math.max(0, base + (Math.random() - 0.5) * 80));
    const maxVal = Math.max(...chValues);
    const domIndex = chValues.indexOf(maxVal);
    await db.insert(iluminacionEspectro).values({
      ch0: chValues[0], ch1: chValues[1], ch2: chValues[2], ch3: chValues[3],
      ch4: chValues[4], ch5: chValues[5], ch6: chValues[6], ch7: chValues[7],
      canalDominante: canalesNombres[domIndex],
      focoEstado: i % 3 === 0 ? "OFF" : "ON",
      fechaLectura: timestamps[i],
    });
  }

  // ========== Sistema de Riego Project ==========
  console.log("Seeding Sistema de Riego project...");
  const riegoTS = [18.5, 19.2, 20.1, 21.3, 22.0, 21.5, 20.8, 19.9, 19.0, 18.6, 19.5, 20.8, 21.8, 22.5, 23.0, 22.4, 21.6, 20.5, 19.8, 19.2, 20.0, 21.2, 22.0, 22.8, 23.2, 22.6, 21.8, 20.8, 20.0, 19.5];
  const riegoTA = [23.5, 24.1, 24.8, 25.5, 26.2, 25.8, 25.0, 24.3, 23.8, 23.4, 24.0, 24.9, 25.8, 26.5, 27.0, 26.6, 25.8, 24.9, 24.2, 23.7, 24.3, 25.2, 26.0, 26.8, 27.2, 26.7, 25.9, 25.0, 24.3, 23.8];
  const riegoHA = [60, 62, 65, 68, 70, 72, 69, 66, 63, 61, 64, 67, 70, 73, 75, 72, 69, 66, 63, 61, 64, 68, 71, 74, 76, 73, 70, 67, 64, 62];
  const riegoHS = [45, 47, 50, 52, 55, 53, 51, 48, 46, 44, 47, 50, 53, 56, 58, 55, 52, 49, 46, 44, 48, 51, 54, 57, 59, 56, 53, 50, 47, 45];
  const riegoK = [120, 125, 130, 128, 135, 140, 138, 132, 127, 122, 128, 134, 139, 142, 145, 140, 136, 130, 126, 123, 129, 135, 140, 143, 146, 141, 137, 132, 128, 125];
  const riegoP = [15, 16, 17, 16, 18, 19, 18, 17, 16, 15, 16, 17, 19, 20, 21, 19, 18, 17, 16, 15, 16, 18, 19, 20, 21, 19, 18, 17, 16, 16];
  const riegoN = [80, 82, 85, 83, 88, 90, 87, 84, 81, 79, 83, 87, 91, 93, 95, 91, 88, 84, 81, 79, 83, 88, 92, 94, 96, 92, 89, 85, 82, 80];

  for (let i = 0; i < 30; i++) {
    await db.insert(riegoTempSuelo).values({ temperaturaSuelo: riegoTS[i], fechaLectura: timestamps[i] });
    await db.insert(riegoTempAmbiente).values({ temperaturaAmbiente: riegoTA[i], fechaLectura: timestamps[i] });
    await db.insert(riegoHumAmbiente).values({ humedadAmbiente: riegoHA[i], fechaLectura: timestamps[i] });
    await db.insert(riegoHumSuelo).values({ humedadSuelo: riegoHS[i], fechaLectura: timestamps[i] });
    await db.insert(riegoPotasio).values({ potasio: riegoK[i], fechaLectura: timestamps[i] });
    await db.insert(riegoFosforo).values({ fosforo: riegoP[i], fechaLectura: timestamps[i] });
    await db.insert(riegoNitrogeno).values({ nitrogeno: riegoN[i], fechaLectura: timestamps[i] });
  }

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
