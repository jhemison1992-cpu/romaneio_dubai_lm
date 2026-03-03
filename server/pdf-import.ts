import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

/**
 * Extrai dados estruturados do PDF de proposta usando LLM
 */
export async function extractPdfData(pdfUrl: string): Promise<any> {
  try {
    // Chamar LLM para extrair dados do PDF
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise de documentos de propostas de caixilhos de alumínio. 
          Sua tarefa é extrair dados estruturados de um PDF de proposta da empresa ALUMINC.
          
          Extraia as seguintes informações para CADA item listado:
          - Item (número sequencial)
          - Tipo (código do caixilho, ex: AL 001, AL 002)
          - Código (ex: CA1, CA2, PB1)
          - Quantidade
          - Largura em mm (L)
          - Altura em mm (H)
          - Localização (formato: AMBIENTE - ANDAR - INTERVALO PAVIMENTOS)
          - Peso em kg
          - Especificações técnicas (como pares chave-valor)
          
          Retorne um JSON válido com a seguinte estrutura:
          {
            "items": [
              {
                "item": 1,
                "type": "AL 001",
                "code": "CA1",
                "quantity": 169,
                "width": 1376,
                "height": 1316,
                "location": "SUITES - ATRIO - 1º AO 29º PAV.",
                "weight": "3.445,481",
                "specifications": {
                  "usa_contramarco": "NAO",
                  "contramarco": "CM174",
                  "tipo_marco": "MARCO CONTRAMARCO",
                  ...
                }
              }
            ]
          }`,
        },
        {
          role: "user",
          content: `Por favor, extraia os dados do seguinte PDF de proposta: ${pdfUrl}
          
          Analise o conteúdo e retorne APENAS o JSON estruturado, sem explicações adicionais.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pdf_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    item: { type: "number" },
                    type: { type: "string" },
                    code: { type: "string" },
                    quantity: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" },
                    location: { type: "string" },
                    weight: { type: "string" },
                    specifications: {
                      type: "object",
                      additionalProperties: { type: "string" },
                    },
                  },
                  required: [
                    "item",
                    "type",
                    "code",
                    "quantity",
                    "width",
                    "height",
                    "location",
                    "weight",
                  ],
                },
              },
            },
            required: ["items"],
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    throw new Error("Invalid response format from LLM");
  } catch (error) {
    console.error("Error extracting PDF data:", error);
    throw error;
  }
}

/**
 * Parseia a localização do formato "AMBIENTE - ANDAR - INTERVALO PAVIMENTOS"
 */
export function parseLocation(location: string): {
  environments: string[];
  floor: string;
  floorRange: { start: number; end: number };
} {
  // Exemplo: "SUITES - ATRIO - 1º AO 29º PAV."
  const parts = location.split(" - ");
  if (parts.length < 3) {
    throw new Error(`Invalid location format: ${location}`);
  }

  const environmentsStr = parts[0].trim();
  const floor = parts[1].trim();
  const rangeStr = parts[2].trim();

  // Parsear ambientes (podem ser separados por "E")
  const environments = environmentsStr
    .split(" E ")
    .map((env) => env.trim());

  // Parsear intervalo de pavimentos (ex: "1º AO 29º PAV.")
  const rangeMatch = rangeStr.match(/(\d+)º.*?(\d+)º/);
  if (!rangeMatch) {
    throw new Error(`Invalid floor range format: ${rangeStr}`);
  }

  const floorRange = {
    start: parseInt(rangeMatch[1]),
    end: parseInt(rangeMatch[2]),
  };

  return { environments, floor, floorRange };
}

/**
 * Importa dados do PDF para o banco de dados
 */
export async function importPdfData(
  projectId: number,
  companyId: number,
  pdfUrl: string,
  pdfFileName: string,
  pdfFileKey: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { pdfImports, floors, rooms, caixilhos } = await import(
    "../drizzle/schema"
  );
  const { eq } = await import("drizzle-orm");

  try {
    // Criar registro de importação
    const importResult = await db.insert(pdfImports).values({
      projectId,
      pdfFileKey,
      pdfFileUrl: pdfUrl,
      pdfFileName,
      status: "processing",
    });

    const importId = importResult[0].insertId;

    // Extrair dados do PDF
    const extractedData = await extractPdfData(pdfUrl);

    // Rastrear contagem de itens criados
    let floorsCreated = 0;
    let roomsCreated = 0;
    let caixilhosCreated = 0;

    // Processar cada item
    for (const item of extractedData.items) {
      try {
        // Parsear localização
        const { environments, floor, floorRange } = parseLocation(
          item.location
        );

        // Criar pavimentos se não existirem
        const floorMap = new Map<number, number>();
        for (let floorNum = floorRange.start; floorNum <= floorRange.end; floorNum++) {
          const existingFloor = await db
            .select()
            .from(floors)
            .where(
              eq(floors.projectId, projectId) &&
                eq(floors.floorNumber, floorNum)
            );

          let floorId: number;
          if (existingFloor.length > 0) {
            floorId = existingFloor[0].id;
          } else {
            const floorResult = await db.insert(floors).values({
              projectId,
              floorNumber: floorNum,
              name: `${floorNum}º Pavimento`,
            });
            floorId = floorResult[0].insertId;
            floorsCreated++;
          }
          floorMap.set(floorNum, floorId);
        }

        // Criar ambientes e caixilhos para cada pavimento
        for (let floorNum = floorRange.start; floorNum <= floorRange.end; floorNum++) {
          const floorId = floorMap.get(floorNum);
          if (!floorId) continue;

          for (const envName of environments) {
            // Criar ambiente se não existir
            const existingRoom = await db
              .select()
              .from(rooms)
              .where(
                eq(rooms.projectId, projectId) &&
                  eq(rooms.floorId, floorId) &&
                  eq(rooms.name, envName)
              );

            let roomId: number;
            if (existingRoom.length > 0) {
              roomId = existingRoom[0].id;
            } else {
              const roomResult = await db.insert(rooms).values({
                projectId,
                floorId,
                name: envName,
                pdfReference: item.location,
              });
              roomId = roomResult[0].insertId;
              roomsCreated++;
            }

            // Criar caixilho
            const caixilhoResult = await db.insert(caixilhos).values({
              projectId,
              roomId,
              code: item.type,
              type: item.code,
              description: `${item.type} - ${envName}`,
              quantity: item.quantity,
              width: item.width,
              height: item.height,
              weight: item.weight,
              specifications: JSON.stringify(item.specifications),
              pdfReference: item.location,
            });
            caixilhosCreated++;
          }
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.item}:`, itemError);
        // Continuar com próximo item
      }
    }

    // Atualizar status de importação
    await db
      .update(pdfImports)
      .set({
        status: "completed",
        extractedData: JSON.stringify(extractedData),
        floorsCreated,
        roomsCreated,
        caixilhosCreated,
      })
      .where(eq(pdfImports.id, importId));

    return {
      importId,
      floorsCreated,
      roomsCreated,
      caixilhosCreated,
    };
  } catch (error) {
    console.error("Error importing PDF data:", error);

    // Atualizar status de importação com erro
    const { pdfImports: pdfImportsTable } = await import(
      "../drizzle/schema"
    );
    const { eq: eqOp } = await import("drizzle-orm");

    await db
      .update(pdfImportsTable)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      .where(eqOp(pdfImportsTable.projectId, projectId));

    throw error;
  }
}

/**
 * Obtém histórico de importações de um projeto
 */
export async function getProjectImports(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const { pdfImports } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  return await db
    .select()
    .from(pdfImports)
    .where(eq(pdfImports.projectId, projectId))
    .orderBy(pdfImports.createdAt);
}

/**
 * Obtém pavimentos de um projeto
 */
export async function getProjectFloors(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  const { floors } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  return await db
    .select()
    .from(floors)
    .where(eq(floors.projectId, projectId))
    .orderBy(floors.floorNumber);
}

/**
 * Obtém ambientes de um pavimento
 */
export async function getFloorRooms(floorId: number) {
  const db = await getDb();
  if (!db) return [];

  const { rooms } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  return await db
    .select()
    .from(rooms)
    .where(eq(rooms.floorId, floorId))
    .orderBy(rooms.name);
}

/**
 * Obtém caixilhos de um ambiente
 */
export async function getRoomCaixilhos(roomId: number) {
  const db = await getDb();
  if (!db) return [];

  const { caixilhos } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const items = await db
    .select()
    .from(caixilhos)
    .where(eq(caixilhos.roomId, roomId));

  // Parse JSON fields
  return items.map((item) => ({
    ...item,
    specifications: item.specifications
      ? JSON.parse(item.specifications)
      : {},
  }));
}
