import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Inspections", () => {
  it("should create a new inspection", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.inspections.create({
      title: "Test Inspection",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list inspections for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const inspections = await caller.inspections.list();

    expect(Array.isArray(inspections)).toBe(true);
  });
});

describe("Environments", () => {
  it("should list all environments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const environments = await caller.environments.list();

    expect(Array.isArray(environments)).toBe(true);
    expect(environments.length).toBeGreaterThan(0);
  });

  it("should have correct environment structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const environments = await caller.environments.list();
    const firstEnv = environments[0];

    expect(firstEnv).toHaveProperty("id");
    expect(firstEnv).toHaveProperty("name");
    expect(firstEnv).toHaveProperty("caixilhoCode");
    expect(firstEnv).toHaveProperty("caixilhoType");
    expect(firstEnv).toHaveProperty("quantity");
  });
});
