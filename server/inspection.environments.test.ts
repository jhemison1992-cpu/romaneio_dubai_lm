import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Inspection Environments", () => {
  let inspectionId: number;
  let envId: number;

  beforeAll(async () => {
    // Criar uma vistoria de teste
    const caller = appRouter.createCaller({});
    const result = await caller.inspections.create({
      title: "Test Inspection for Environments",
      projectId: 1,
    });
    inspectionId = result.id;
  });

  it("should create a new inspection environment", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.inspectionEnvironments.create({
      inspectionId,
      name: "Sala de Teste",
      caixilhoCode: "T01",
      caixilhoType: "Janela de Teste",
      quantity: 2,
    });

    expect(result.id).toBeGreaterThan(0);
    envId = result.id;
  });

  it("should list inspection environments", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.inspectionEnvironments.list({ inspectionId });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("Sala de Teste");
    expect(result[0].caixilhoCode).toBe("T01");
    expect(result[0].quantity).toBe(2);
  });

  it("should update inspection environment", async () => {
    const caller = appRouter.createCaller({});
    await caller.inspectionEnvironments.update({
      id: envId,
      name: "Sala Atualizada",
      quantity: 3,
    });

    const result = await caller.inspectionEnvironments.list({ inspectionId });
    const updated = result.find((env) => env.id === envId);

    expect(updated?.name).toBe("Sala Atualizada");
    expect(updated?.quantity).toBe(3);
  });

  it("should create environment with planta file", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.inspectionEnvironments.create({
      inspectionId,
      name: "Sala com Planta",
      caixilhoCode: "P01",
      caixilhoType: "Porta de Teste",
      quantity: 1,
      plantaFileKey: "test-key-123",
      plantaFileUrl: "https://example.com/planta.pdf",
    });

    expect(result.id).toBeGreaterThan(0);

    const envs = await caller.inspectionEnvironments.list({ inspectionId });
    const withPlanta = envs.find((env) => env.id === result.id);

    expect(withPlanta?.plantaFileKey).toBe("test-key-123");
    expect(withPlanta?.plantaFileUrl).toBe("https://example.com/planta.pdf");
  });

  it("should delete inspection environment", async () => {
    const caller = appRouter.createCaller({});
    await caller.inspectionEnvironments.delete({ id: envId });

    const result = await caller.inspectionEnvironments.list({ inspectionId });
    const deleted = result.find((env) => env.id === envId);

    expect(deleted).toBeUndefined();
  });
});
