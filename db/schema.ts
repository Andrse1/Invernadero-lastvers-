import {
  mysqlTable,
  mysqlEnum,
  serial,
  float,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/mysql-core";

// ============================================================================
// Auth tables (required by backend infrastructure)
// ============================================================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// PROYECTO 1: CO2 - Tablas independientes
// ============================================================================
export const co2Humedad = mysqlTable("co2_humedad", {
  id: serial("id").primaryKey(),
  humedad: float("humedad").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const co2Temperatura = mysqlTable("co2_temperatura", {
  id: serial("id").primaryKey(),
  temperatura: float("temperatura").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const co2Concentracion = mysqlTable("co2_concentracion", {
  id: serial("id").primaryKey(),
  co2Ppm: float("co2_ppm").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export type Co2Humedad = typeof co2Humedad.$inferSelect;
export type Co2Temperatura = typeof co2Temperatura.$inferSelect;
export type Co2Concentracion = typeof co2Concentracion.$inferSelect;

// ============================================================================
// PROYECTO 2: NEBULIZADOR - Tablas independientes
// ============================================================================
export const nebulizadorHumedad = mysqlTable("nebulizador_humedad", {
  id: serial("id").primaryKey(),
  humedad: float("humedad").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export type NebulizadorHumedad = typeof nebulizadorHumedad.$inferSelect;

// ============================================================================
// PROYECTO 3: ILUMINACION - Tablas independientes
// ============================================================================
export const iluminacionPpfd = mysqlTable("iluminacion_ppfd", {
  id: serial("id").primaryKey(),
  ppfd: float("ppfd").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const iluminacionDli = mysqlTable("iluminacion_dli", {
  id: serial("id").primaryKey(),
  dliAcumulado: float("dli_acumulado").notNull(),
  dliTotal: float("dli_total").notNull(),
  dliObjetivo: float("dli_objetivo").notNull(),
  porcentaje: float("porcentaje").notNull(),
  excedente: float("excedente").notNull().default(0),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const iluminacionEspectro = mysqlTable("iluminacion_espectro", {
  id: serial("id").primaryKey(),
  ch0: float("ch0").notNull().default(0),
  ch1: float("ch1").notNull().default(0),
  ch2: float("ch2").notNull().default(0),
  ch3: float("ch3").notNull().default(0),
  ch4: float("ch4").notNull().default(0),
  ch5: float("ch5").notNull().default(0),
  ch6: float("ch6").notNull().default(0),
  ch7: float("ch7").notNull().default(0),
  canalDominante: varchar("canal_dominante", { length: 50 }).notNull().default("—"),
  focoEstado: varchar("foco_estado", { length: 10 }).notNull().default("OFF"),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export type IluminacionPpfd = typeof iluminacionPpfd.$inferSelect;
export type IluminacionDli = typeof iluminacionDli.$inferSelect;
export type IluminacionEspectro = typeof iluminacionEspectro.$inferSelect;

// ============================================================================
// PROYECTO 4: SISTEMA DE RIEGO - Tablas independientes
// ============================================================================
export const riegoTempSuelo = mysqlTable("riego_temp_suelo", {
  id: serial("id").primaryKey(),
  temperaturaSuelo: float("temperatura_suelo").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoTempAmbiente = mysqlTable("riego_temp_ambiente", {
  id: serial("id").primaryKey(),
  temperaturaAmbiente: float("temperatura_ambiente").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoHumAmbiente = mysqlTable("riego_hum_ambiente", {
  id: serial("id").primaryKey(),
  humedadAmbiente: float("humedad_ambiente").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoHumSuelo = mysqlTable("riego_hum_suelo", {
  id: serial("id").primaryKey(),
  humedadSuelo: float("humedad_suelo").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoPotasio = mysqlTable("riego_potasio", {
  id: serial("id").primaryKey(),
  potasio: float("potasio").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoFosforo = mysqlTable("riego_fosforo", {
  id: serial("id").primaryKey(),
  fosforo: float("fosforo").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export const riegoNitrogeno = mysqlTable("riego_nitrogeno", {
  id: serial("id").primaryKey(),
  nitrogeno: float("nitrogeno").notNull(),
  fechaLectura: timestamp("fecha_lectura").defaultNow().notNull(),
});

export type RiegoTempSuelo = typeof riegoTempSuelo.$inferSelect;
export type RiegoTempAmbiente = typeof riegoTempAmbiente.$inferSelect;
export type RiegoHumAmbiente = typeof riegoHumAmbiente.$inferSelect;
export type RiegoHumSuelo = typeof riegoHumSuelo.$inferSelect;
export type RiegoPotasio = typeof riegoPotasio.$inferSelect;
export type RiegoFosforo = typeof riegoFosforo.$inferSelect;
export type RiegoNitrogeno = typeof riegoNitrogeno.$inferSelect;
