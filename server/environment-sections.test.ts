import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

/**
 * Testes para as funcionalidades de seções de ambiente
 * (Mão de obra, Equipamentos, Atividades, Ocorrências, Materiais, Comentários)
 * 
 * Nota: Estes testes requerem que um ambiente de inspeção (inspectionEnvironments)
 * já exista no banco de dados. Os testes usam um ID fixo para simplificar.
 */

describe("Environment Sections - CRUD Operations", () => {
  // Usar um ID de ambiente que já existe ou que será criado
  // Para este teste, assumimos que o ambiente com ID 1 existe
  const testEnvId = 1;

  describe("Labor Items", () => {
    it("should list labor items (empty or existing)", async () => {
      const items = await db.getLaborItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Equipment Items", () => {
    it("should list equipment items (empty or existing)", async () => {
      const items = await db.getEquipmentItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Activity Items", () => {
    it("should list activity items (empty or existing)", async () => {
      const items = await db.getActivityItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Occurrence Items", () => {
    it("should list occurrence items (empty or existing)", async () => {
      const items = await db.getOccurrenceItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Received Material Items", () => {
    it("should list received material items (empty or existing)", async () => {
      const items = await db.getReceivedMaterialItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Used Material Items", () => {
    it("should list used material items (empty or existing)", async () => {
      const items = await db.getUsedMaterialItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Comment Items", () => {
    it("should list comment items (empty or existing)", async () => {
      const items = await db.getCommentItems(testEnvId);
      expect(Array.isArray(items)).toBe(true);
    });
  });
});

describe("Environment Sections - Database Functions Exist", () => {
  it("should have createLaborItem function", () => {
    expect(typeof db.createLaborItem).toBe("function");
  });

  it("should have updateLaborItem function", () => {
    expect(typeof db.updateLaborItem).toBe("function");
  });

  it("should have deleteLaborItem function", () => {
    expect(typeof db.deleteLaborItem).toBe("function");
  });

  it("should have createEquipmentItem function", () => {
    expect(typeof db.createEquipmentItem).toBe("function");
  });

  it("should have updateEquipmentItem function", () => {
    expect(typeof db.updateEquipmentItem).toBe("function");
  });

  it("should have deleteEquipmentItem function", () => {
    expect(typeof db.deleteEquipmentItem).toBe("function");
  });

  it("should have createActivityItem function", () => {
    expect(typeof db.createActivityItem).toBe("function");
  });

  it("should have updateActivityItem function", () => {
    expect(typeof db.updateActivityItem).toBe("function");
  });

  it("should have deleteActivityItem function", () => {
    expect(typeof db.deleteActivityItem).toBe("function");
  });

  it("should have createOccurrenceItem function", () => {
    expect(typeof db.createOccurrenceItem).toBe("function");
  });

  it("should have updateOccurrenceItem function", () => {
    expect(typeof db.updateOccurrenceItem).toBe("function");
  });

  it("should have deleteOccurrenceItem function", () => {
    expect(typeof db.deleteOccurrenceItem).toBe("function");
  });

  it("should have createReceivedMaterialItem function", () => {
    expect(typeof db.createReceivedMaterialItem).toBe("function");
  });

  it("should have updateReceivedMaterialItem function", () => {
    expect(typeof db.updateReceivedMaterialItem).toBe("function");
  });

  it("should have deleteReceivedMaterialItem function", () => {
    expect(typeof db.deleteReceivedMaterialItem).toBe("function");
  });

  it("should have createUsedMaterialItem function", () => {
    expect(typeof db.createUsedMaterialItem).toBe("function");
  });

  it("should have updateUsedMaterialItem function", () => {
    expect(typeof db.updateUsedMaterialItem).toBe("function");
  });

  it("should have deleteUsedMaterialItem function", () => {
    expect(typeof db.deleteUsedMaterialItem).toBe("function");
  });

  it("should have createCommentItem function", () => {
    expect(typeof db.createCommentItem).toBe("function");
  });

  it("should have updateCommentItem function", () => {
    expect(typeof db.updateCommentItem).toBe("function");
  });

  it("should have deleteCommentItem function", () => {
    expect(typeof db.deleteCommentItem).toBe("function");
  });
});
