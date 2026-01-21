import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

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
 * Empresas/Organizacoes na plataforma SaaS
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: varchar("logo_url", { length: 1000 }),
  subscriptionPlan: mysqlEnum("subscription_plan", ["pro", "enterprise"]).default("pro").notNull(),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "paused", "cancelled"]).default("active").notNull(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Relacao entre usuarios e empresas (com papeis)
 */
export const companyUsers = mysqlTable("company_users", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["admin", "supervisor", "technician", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyUser = typeof companyUsers.$inferSelect;
export type InsertCompanyUser = typeof companyUsers.$inferInsert;

/**
 * Usuarios do sistema com autenticacao propria (username/password)
 */
export const appUsers = mysqlTable("app_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profilePhoto: text("profile_photo"),
  active: int("active").default(1).notNull(),
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
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  contractor: varchar("contractor", { length: 255 }),
  technicalManager: varchar("technical_manager", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }).default("ALUMINC Esquadrias Metalicas Industria e Comercio Ltda."),
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
  plantaFileKey: varchar("planta_file_key", { length: 500 }),
  plantaFileUrl: varchar("planta_file_url", { length: 1000 }),
  projectFileKey: varchar("project_file_key", { length: 500 }),
  projectFileUrl: varchar("project_file_url", { length: 1000 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = typeof environments.$inferInsert;

/**
 * Vistorias/romaneios criados pelos usuarios
 */
export const inspections = mysqlTable("inspections", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
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
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  inspectionId: int("inspection_id").notNull().references(() => inspections.id, { onDelete: "cascade" }),
  environmentId: int("environment_id").notNull().references(() => environments.id),
  releaseDate: timestamp("release_date", { mode: "date" }),
  responsibleConstruction: varchar("responsible_construction", { length: 255 }),
  responsibleSupplier: varchar("responsible_supplier", { length: 255 }),
  observations: text("observations"),
  signatureConstruction: text("signature_construction"),
  signatureSupplier: text("signature_supplier"),
  deliveryTermSignature: text("delivery_term_signature"),
  deliveryTermResponsible: varchar("delivery_term_responsible", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InspectionItem = typeof inspectionItems.$inferSelect;
export type InsertInspectionItem = typeof inspectionItems.$inferInsert;

/**
 * Arquivos de midia (fotos e videos) associados aos itens de vistoria
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
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

/**
 * Ambientes adicionados diretamente na vistoria (independente de obra)
 */
export const inspectionEnvironments = mysqlTable("inspection_environments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  inspectionId: int("inspection_id").notNull().references(() => inspections.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  caixilhoCode: varchar("caixilho_code", { length: 50 }).notNull(),
  caixilhoType: text("caixilho_type").notNull(),
  quantity: int("quantity").notNull().default(1),
  plantaFileKey: varchar("planta_file_key", { length: 500 }),
  plantaFileUrl: varchar("planta_file_url", { length: 1000 }),
  projectFileKey: varchar("project_file_key", { length: 500 }),
  projectFileUrl: varchar("project_file_url", { length: 1000 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InspectionEnvironment = typeof inspectionEnvironments.$inferSelect;
export type InsertInspectionEnvironment = typeof inspectionEnvironments.$inferInsert;

/**
 * Etapas de evolucao da instalacao do caixilho
 */
export const installationSteps = mysqlTable("installation_steps", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  inspectionItemId: int("inspection_item_id").notNull().references(() => inspectionItems.id, { onDelete: "cascade" }),
  stepName: varchar("step_name", { length: 100 }).notNull(),
  stepOrder: int("step_order").notNull(),
  isCompleted: int("is_completed").default(0).notNull(),
  completedQuantity: int("completed_quantity").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallationStep = typeof installationSteps.$inferSelect;
export type InsertInstallationStep = typeof installationSteps.$inferInsert;

/**
 * Faturas e historico de pagamentos
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).unique(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Planos de assinatura disponiveis
 */
export const pricingPlans = mysqlTable("pricing_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "Free", "Pro", "Enterprise"
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "free", "pro", "enterprise"
  description: text("description"),
  monthlyPrice: int("monthly_price").notNull(), // em centavos USD (ex: 4900 = $49.00)
  annualPrice: int("annual_price").notNull(), // em centavos USD (ex: 49900 = $499.00)
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdAnnual: varchar("stripe_price_id_annual", { length: 255 }),
  maxProjects: int("max_projects"), // null = ilimitado
  maxUsers: int("max_users"), // null = ilimitado
  maxMediaSize: int("max_media_size"), // em MB, null = ilimitado
  features: json("features").$type<Record<string, any>>().default(sql`JSON_ARRAY()`), // array de features
  isActive: int("is_active").default(1).notNull(),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;

/**
 * Historico de mudancas de plano
 */
export const subscriptionHistory = mysqlTable("subscription_history", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  planId: int("plan_id").notNull().references(() => pricingPlans.id),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "annual"]).notNull(),
  previousPlanId: int("previous_plan_id").references(() => pricingPlans.id),
  changeReason: varchar("change_reason", { length: 255 }),
  effectiveDate: timestamp("effective_date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
