import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { appUsers, type AppUser, type InsertAppUser } from "../drizzle/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAppUser(data: Omit<InsertAppUser, "passwordHash"> & { password: string }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await hashPassword(data.password);
  
  const result = await db.insert(appUsers).values({
    username: data.username,
    passwordHash,
    name: data.name,
    role: data.role || "user",
    active: data.active ?? 1,
  });

  return Number(result[0].insertId);
}

export async function getAppUserByUsername(username: string): Promise<AppUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(appUsers).where(eq(appUsers.username, username)).limit(1);
  return result[0];
}

export async function getAllAppUsers(): Promise<AppUser[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(appUsers);
}

export async function updateAppUser(id: number, data: Partial<Omit<InsertAppUser, "id" | "passwordHash">> & { password?: string }): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { ...data };
  
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }

  await db.update(appUsers).set(updateData).where(eq(appUsers.id, id));
}

export async function deleteAppUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(appUsers).where(eq(appUsers.id, id));
}

export async function authenticateUser(username: string, password: string): Promise<AppUser | null> {
  const user = await getAppUserByUsername(username);
  
  if (!user || user.active !== 1) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  return isValid ? user : null;
}
