import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Usuários do sistema com autenticação própria (username/password)
 */
export const appUsers = mysqlTable("app_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profilePhoto: text("profile_photo"), // URL da foto de perfil armazenada no S3
  active: int("active").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AppUser = typeof appUsers.$inferSelect;
export type InsertAppUser = typeof appUsers.$inferInsert;

/**
 * Obras/Projetos cadastrados no sistema
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  contractor: varchar("contractor", { length: 255 }),
  technicalManager: varchar("technical_manager", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }).default("ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda."),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Ambientes do empreendimento com seus respectivos caixilhos
 */
export const environments = mysqlTable("environments", {
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  caixilhoCode: varchar("caixilho_code", { length: 50 }).notNull(),
  caixilhoType: text("caixilho_type").notNull(),
  quantity: int("quantity").notNull().default(1),
  plantaFileKey: varchar("planta_file_key", { length: 500 }), // Chave do arquivo da planta no S3
  plantaFileUrl: varchar("planta_file_url", { length: 1000 }), // URL da planta
  projectFileKey: varchar("project_file_key", { length: 500 }), // Chave do arquivo do projeto do caixilho no S3
  projectFileUrl: varchar("project_file_url", { length: 1000 }), // URL do projeto do caixilho
  startDate: date("start_date"), // Data de início da instalação
  endDate: date("end_date"), // Data de término da instalação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = typeof environments.$inferInsert;

/**
 * Vistorias/romaneios criados pelos usuários
 */
export const inspections = mysqlTable("inspections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = typeof inspections.$inferInsert;

/**
 * Itens individuais de cada vistoria (um por ambiente)
 */
export const inspectionItems = mysqlTable("inspection_items", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspection_id").notNull().references(() => inspections.id, { onDelete: "cascade" }),
  environmentId: int("environment_id").notNull().references(() => environments.id),
  releaseDate: timestamp("release_date"),
  responsibleConstruction: varchar("responsible_construction", { length: 255 }),
  responsibleSupplier: varchar("responsible_supplier", { length: 255 }),
  observations: text("observations"),
  signatureConstruction: text("signature_construction"), // Base64 da assinatura do responsável da obra
  signatureSupplier: text("signature_supplier"), // Base64 da assinatura do responsável do fornecedor
  deliveryTermSignature: text("delivery_term_signature"), // Base64 da assinatura do responsável no termo de entrega
  deliveryTermResponsible: varchar("delivery_term_responsible", { length: 255 }), // Nome do responsável que assinou o termo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InspectionItem = typeof inspectionItems.$inferSelect;
export type InsertInspectionItem = typeof inspectionItems.$inferInsert;

/**
 * Arquivos de mídia (fotos e vídeos) associados aos itens de vistoria
 */
export const mediaFiles = mysqlTable("media_files", {
  id: int("id").autoincrement().primaryKey(),
  inspectionItemId: int("inspection_item_id").notNull().references(() => inspectionItems.id, { onDelete: "cascade" }),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  fileUrl: varchar("file_url", { length: 1000 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: int("file_size").notNull(),
  mediaType: mysqlEnum("media_type", ["photo", "video"]).notNull(),
  comment: text("comment"), // Comentário sobre a foto/vídeo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

/**
 * Ambientes adicionados diretamente na vistoria (independente de obra)
 */
export const inspectionEnvironments = mysqlTable("inspection_environments", {
  id: int("id").autoincrement().primaryKey(),
  inspectionId: int("inspection_id").notNull().references(() => inspections.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  caixilhoCode: varchar("caixilho_code", { length: 50 }).notNull(),
  caixilhoType: text("caixilho_type").notNull(),
  quantity: int("quantity").notNull().default(1),
  plantaFileKey: varchar("planta_file_key", { length: 500 }), // Chave do arquivo da planta no S3
  plantaFileUrl: varchar("planta_file_url", { length: 1000 }), // URL da planta
  projectFileKey: varchar("project_file_key", { length: 500 }), // Chave do arquivo do projeto do caixilho no S3
  projectFileUrl: varchar("project_file_url", { length: 1000 }), // URL do projeto do caixilho
  startDate: date("start_date"), // Data de início da instalação
  endDate: date("end_date"), // Data de término da instalação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InspectionEnvironment = typeof inspectionEnvironments.$inferSelect;
export type InsertInspectionEnvironment = typeof inspectionEnvironments.$inferInsert;
/**
 * Etapas de evolução da instalação do caixilho
 */
export const installationSteps = mysqlTable("installation_steps", {
  id: int("id").autoincrement().primaryKey(),
  inspectionItemId: int("inspection_item_id").notNull().references(() => inspectionItems.id, { onDelete: "cascade" }),
  stepName: varchar("step_name", { length: 100 }).notNull(), // Nome da etapa (ex: Medição, Fabricação, Instalação, Acabamento)
  stepOrder: int("step_order").notNull(), // Ordem da etapa (1, 2, 3, 4...)
  isCompleted: int("is_completed").default(0).notNull(), // 0 = não concluída, 1 = concluída
  completedAt: timestamp("completed_at"), // Data/hora de conclusão da etapa
  notes: text("notes"), // Observações sobre a etapa
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallationStep = typeof installationSteps.$inferSelect;
export type InsertInstallationStep = typeof installationSteps.$inferInsert;
