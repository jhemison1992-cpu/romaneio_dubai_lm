import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

describe("Media Comment Update", () => {
  let testContext: TrpcContext;
  let testInspectionId: number;
  let testInspectionItemId: number;
  let testMediaId: number;

  beforeAll(async () => {
    // Mock context for public procedures
    testContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    // Create test inspection
    const createInspectionResult = await appRouter
      .createCaller(testContext)
      .inspections.create({ title: "Test Media Comments", projectId: 1 });
    testInspectionId = createInspectionResult.id;

    // Create test inspection item
    const upsertItemResult = await appRouter
      .createCaller(testContext)
      .inspectionItems.upsert({
        inspectionId: testInspectionId,
        environmentId: 1,
      });
    testInspectionItemId = upsertItemResult.id;

    // Create test media file
    const uploadResult = await appRouter
      .createCaller(testContext)
      .media.upload({
        inspectionItemId: testInspectionItemId,
        fileData: Buffer.from("fake image data").toString("base64"),
        fileName: "test-photo.jpg",
        mimeType: "image/jpeg",
        mediaType: "photo",
      });
    testMediaId = uploadResult.id;
  });

  it("should update media comment successfully", async () => {
    const comment = "Esta foto mostra o caixilho instalado corretamente";

    const result = await appRouter
      .createCaller(testContext)
      .media.updateComment({
        id: testMediaId,
        comment,
      });

    expect(result.success).toBe(true);

    // Verify comment was saved
    const mediaList = await appRouter
      .createCaller(testContext)
      .media.list({ inspectionItemId: testInspectionItemId });

    const updatedMedia = mediaList.find((m) => m.id === testMediaId);
    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.comment).toBe(comment);
  });

  it("should update comment to empty string", async () => {
    const emptyComment = "";

    const result = await appRouter
      .createCaller(testContext)
      .media.updateComment({
        id: testMediaId,
        comment: emptyComment,
      });

    expect(result.success).toBe(true);

    // Verify comment was updated
    const mediaList = await appRouter
      .createCaller(testContext)
      .media.list({ inspectionItemId: testInspectionItemId });

    const updatedMedia = mediaList.find((m) => m.id === testMediaId);
    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.comment).toBe(emptyComment);
  });

  it("should handle long comments", async () => {
    const longComment = "A".repeat(500);

    const result = await appRouter
      .createCaller(testContext)
      .media.updateComment({
        id: testMediaId,
        comment: longComment,
      });

    expect(result.success).toBe(true);

    // Verify long comment was saved
    const mediaList = await appRouter
      .createCaller(testContext)
      .media.list({ inspectionItemId: testInspectionItemId });

    const updatedMedia = mediaList.find((m) => m.id === testMediaId);
    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.comment).toBe(longComment);
  });

  it("should handle special characters in comments", async () => {
    const specialComment = "Caixilho com ângulo de 45°, medindo 2,5m × 1,8m (área: 4,5m²)";

    const result = await appRouter
      .createCaller(testContext)
      .media.updateComment({
        id: testMediaId,
        comment: specialComment,
      });

    expect(result.success).toBe(true);

    // Verify special characters were preserved
    const mediaList = await appRouter
      .createCaller(testContext)
      .media.list({ inspectionItemId: testInspectionItemId });

    const updatedMedia = mediaList.find((m) => m.id === testMediaId);
    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.comment).toBe(specialComment);
  });
});
