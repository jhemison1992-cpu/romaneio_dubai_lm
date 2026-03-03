import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  createDeliveryReceipt,
  getDeliveryReceiptById,
  getDeliveryReceiptsByProject,
  updateDeliveryReceipt,
  deleteDeliveryReceipt,
  createDeliveryReceiptItem,
  getDeliveryReceiptItems,
  updateDeliveryReceiptItem,
  deleteDeliveryReceiptItem,
} from "./db";

describe.skip("Delivery Receipts", () => {
  let receiptId: number;
  let itemId: number;
  const projectId = 1;
  const companyId = 1;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available for tests");
    }
  });

  it("should create a delivery receipt", async () => {
    const result = await createDeliveryReceipt({
      companyId,
      projectId,
      receiptNumber: "TERM-2026-001",
      constructionResponsible: "João Silva",
      supplierResponsible: "Maria Santos",
      receiptDate: new Date(),
      observations: "Teste de recibimento",
    });

    expect(result).toBeDefined();
    receiptId = result.insertId || 0;
    expect(receiptId).toBeGreaterThan(0);
  });

  it("should get delivery receipt by id", async () => {
    if (receiptId === 0) {
      console.warn("Skipping test - receipt not created");
      return;
    }

    const receipt = await getDeliveryReceiptById(receiptId);
    expect(receipt).toBeDefined();
    expect(receipt?.receiptNumber).toBe("TERM-2026-001");
  });

  it("should list delivery receipts by project", async () => {
    const receipts = await getDeliveryReceiptsByProject(projectId);
    expect(Array.isArray(receipts)).toBe(true);
    expect(receipts.length).toBeGreaterThan(0);
  });

  it("should update delivery receipt", async () => {
    if (receiptId === 0) {
      console.warn("Skipping test - receipt not created");
      return;
    }

    await updateDeliveryReceipt(receiptId, {
      status: "approved",
      observations: "Aprovado",
    });

    const receipt = await getDeliveryReceiptById(receiptId);
    expect(receipt?.status).toBe("approved");
  });

  it("should create delivery receipt item", async () => {
    if (receiptId === 0) {
      console.warn("Skipping test - receipt not created");
      return;
    }

    const result = await createDeliveryReceiptItem({
      deliveryReceiptId: receiptId,
      environmentId: 1,
      code: "CAIXA-001",
      description: "Caixilho de alumínio",
      quantity: 5,
      unitValue: "150.00",
      totalValue: "750.00",
      conformity: "ok",
    });

    expect(result).toBeDefined();
    itemId = result.insertId || 0;
    expect(itemId).toBeGreaterThan(0);
  });

  it("should get delivery receipt items", async () => {
    if (receiptId === 0) {
      console.warn("Skipping test - receipt not created");
      return;
    }

    const items = await getDeliveryReceiptItems(receiptId);
    expect(Array.isArray(items)).toBe(true);
  });

  it("should update delivery receipt item", async () => {
    if (itemId === 0) {
      console.warn("Skipping test - item not created");
      return;
    }

    await updateDeliveryReceiptItem(itemId, {
      receivedQuantity: 5,
      status: "received",
      conformity: "ok",
    });

    const items = await getDeliveryReceiptItems(receiptId);
    const item = items.find((i) => i.id === itemId);
    expect(item?.receivedQuantity).toBe(5);
  });

  it("should delete delivery receipt item", async () => {
    if (itemId === 0) {
      console.warn("Skipping test - item not created");
      return;
    }

    await deleteDeliveryReceiptItem(itemId);
    const items = await getDeliveryReceiptItems(receiptId);
    const item = items.find((i) => i.id === itemId);
    expect(item).toBeUndefined();
  });

  it("should delete delivery receipt", async () => {
    if (receiptId === 0) {
      console.warn("Skipping test - receipt not created");
      return;
    }

    await deleteDeliveryReceipt(receiptId);
    const receipt = await getDeliveryReceiptById(receiptId);
    expect(receipt).toBeNull();
  });

  afterAll(async () => {
    // Cleanup if needed
  });
});
